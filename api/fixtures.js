export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  try {
    const leagueIdsParam = (req.query.leagueIds ?? "732,2,8,564,384").toString().trim();
    let leagueIds = leagueIdsParam
      ? leagueIdsParam.split(",").map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n))
      : [732, 2, 8, 564, 384];
    const days = Math.max(1, parseInt(req.query.days ?? "90", 10) || 90);
    const debugAll = (req.query.all ?? "").toString().toLowerCase() === "true";
    const includeEuropa = (req.query.includeEuropa ?? "false").toString().toLowerCase() === "true";
    if (includeEuropa && !leagueIds.includes(5)) {
      leagueIds = [...leagueIds, 5];
    }
    leagueIds = [...new Set(leagueIds)];

    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + days);
    const endDate = end.toISOString().slice(0, 10);

    const includeAll = "participants;league;scores";
    const includeFiltered = "participants;league;scores;round;stage";
    const include = debugAll ? includeAll : includeFiltered;
    const base = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?api_token=${token}&per_page=50&include=${encodeURIComponent(include)}`;
    const url = debugAll
      ? base
      : `${base}&filters=fixtureLeagues:${encodeURIComponent(leagueIds.join(","))}`;

    const r = await fetch(url);
    const raw = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: "Sportmonks error",
        details: raw,
      });
    }

    const list = Array.isArray(raw?.data) ? raw.data : [];
    const fixtures = list.map((f) => {
      const participants = f.participants ?? [];
      let home = null;
      let away = null;
      const byLocation = participants.find((p) => p.meta?.location === "home");
      const awayByLoc = participants.find((p) => p.meta?.location === "away");
      if (byLocation && awayByLoc) {
        home = { id: byLocation.id, name: byLocation.name ?? byLocation.short_code ?? "" };
        away = { id: awayByLoc.id, name: awayByLoc.name ?? awayByLoc.short_code ?? "" };
      } else if (participants.length >= 2) {
        home = { id: participants[0].id, name: participants[0].name ?? participants[0].short_code ?? "" };
        away = { id: participants[1].id, name: participants[1].name ?? participants[1].short_code ?? "" };
      }
      const league = f.league ?? {};
      return {
        id: f.id,
        starting_at: f.starting_at,
        state_id: f.state_id,
        league: {
          id: league.id,
          name: league.name ?? "",
          season_id: league.season_id ?? null,
        },
        home,
        away,
      };
    });

    fixtures.sort((a, b) => (a.starting_at || "").localeCompare(b.starting_at || ""));

    const payload = {
      ok: true,
      source: "sportmonks",
      fetchedAt: new Date().toISOString(),
      startDate,
      endDate,
      leagueIds,
      count: fixtures.length,
      fixtures,
    };
    if (debugAll) payload.debugAll = true;
    res.status(200).json(payload);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
