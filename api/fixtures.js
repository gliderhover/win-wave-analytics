const MAX_DAYS = 100;

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
    const parsedDays = parseInt(req.query.days ?? "30", 10);
    const daysRequested = Number.isNaN(parsedDays) || parsedDays <= 0 ? 30 : parsedDays;
    const days = Math.max(1, Math.min(daysRequested, MAX_DAYS));
    const rawMode = (req.query.raw ?? "").toString().toLowerCase() === "true";
    const debugUrlFlag = (req.query.debugUrl ?? "").toString().toLowerCase() === "true";
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

    const baseNoToken = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?per_page=50&include=${encodeURIComponent(include)}`;
    const base = `${baseNoToken}&api_token=${token}`;

    const url = debugAll
      ? base
      : `${base}&filters=fixtureLeagues:${encodeURIComponent(leagueIds.join(","))}`;

    const debugUrlValue = debugUrlFlag
      ? (debugAll
          ? baseNoToken
          : `${baseNoToken}&filters=fixtureLeagues:${encodeURIComponent(leagueIds.join(","))}`)
      : undefined;

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
    const apiCount = list.length;
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

    if (rawMode) {
      const sample = list.slice(0, 5).map((f) => ({
        id: f.id,
        name: f.name ?? null,
        starting_at: f.starting_at,
      }));
      const limitedFixtures = fixtures.slice(0, 20);
      const payload = {
        ok: true,
        raw: true,
        fetchedAt: new Date().toISOString(),
        startDate,
        endDate,
        leagueIds,
        daysRequested,
        daysUsed: days,
        apiCount,
        sample,
        count: limitedFixtures.length,
        fixtures: limitedFixtures,
      };
      if (debugUrlValue) payload.debugUrl = debugUrlValue;
      return res.status(200).json(payload);
    }

    const payload = {
      ok: true,
      source: "sportmonks",
      fetchedAt: new Date().toISOString(),
      startDate,
      endDate,
      leagueIds,
      daysRequested,
      daysUsed: days,
      count: fixtures.length,
      fixtures,
    };
    if (debugAll) payload.debugAll = true;
    if (debugUrlValue) payload.debugUrl = debugUrlValue;
    res.status(200).json(payload);
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
