export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  try {
    const leagueIdsParam = (req.query.leagueIds ?? "").toString().trim();
    const minutesParam = parseInt((req.query.minutes ?? "30").toString(), 10);
    const minutes = Number.isNaN(minutesParam) || minutesParam <= 0 ? 30 : minutesParam;

    const url = `https://api.sportmonks.com/v3/football/livescores/inplay?api_token=${token}&include=${encodeURIComponent(
      "participants;league;scores"
    )}`;

    const r = await fetch(url);
    const raw = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: "Sportmonks error",
        details: raw,
      });
    }

    let list = Array.isArray(raw?.data) ? raw.data : [];

    // Optional league filter
    if (leagueIdsParam) {
      const allowedIds = leagueIdsParam
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((n) => !Number.isNaN(n));
      const allowedSet = new Set(allowedIds);
      list = list.filter((f) => allowedSet.has(f.league_id ?? f.league?.id));
    }

    // Optional minutes window filter (approximate: state minute <= minutes)
    // Sportmonks exposes minute under scores or time; if unavailable, keep fixture.
    const now = new Date();
    const cutoffMs = minutes * 60 * 1000;

    const fixtures = list.map((f) => {
      const participants = f.participants ?? [];
      let home = null;
      let away = null;
      const byLocationHome = participants.find((p) => p.meta?.location === "home");
      const byLocationAway = participants.find((p) => p.meta?.location === "away");
      if (byLocationHome && byLocationAway) {
        home = { id: byLocationHome.id, name: byLocationHome.name ?? byLocationHome.short_code ?? "" };
        away = { id: byLocationAway.id, name: byLocationAway.name ?? byLocationAway.short_code ?? "" };
      } else if (participants.length >= 2) {
        home = { id: participants[0].id, name: participants[0].name ?? participants[0].short_code ?? "" };
        away = { id: participants[1].id, name: participants[1].name ?? participants[1].short_code ?? "" };
      }

      const league = f.league ?? {};

      // Scores: try to find current score from scores collection
      const scores = Array.isArray(f.scores) ? f.scores : [];
      let currentScore = null;
      if (scores.length > 0) {
        // Prefer 'live' or 'current' score types, otherwise first entry
        const liveScore =
          scores.find((s) => s.score_type === "live") ||
          scores.find((s) => s.score_type === "current") ||
          scores[0];
        currentScore = {
          home: liveScore?.home_score ?? null,
          away: liveScore?.away_score ?? null,
          description: liveScore?.description ?? null,
        };
      }

      return {
        id: f.id,
        starting_at: f.starting_at,
        state_id: f.state_id ?? null,
        league: {
          id: league.id,
          name: league.name ?? "",
          season_id: league.season_id ?? null,
        },
        home,
        away,
        scores: currentScore,
      };
    });

    // Filter by minutes window if possible, based on starting_at
    const filteredFixtures = fixtures.filter((fx) => {
      if (!fx.starting_at) return true;
      const dt = new Date(fx.starting_at.replace(" ", "T") + "Z");
      if (Number.isNaN(dt.getTime())) return true;
      const diff = now.getTime() - dt.getTime();
      return diff >= 0 && diff <= cutoffMs;
    });

    filteredFixtures.sort((a, b) => (a.starting_at || "").localeCompare(b.starting_at || ""));

    return res.status(200).json({
      ok: true,
      fetchedAt: new Date().toISOString(),
      count: filteredFixtures.length,
      fixtures: filteredFixtures,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}

