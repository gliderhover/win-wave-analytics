export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  const leagueIdsParam = (req.query.leagueIds ?? "779").toString().trim();
  const leagueIds = leagueIdsParam || "779";

  try {
    const url = `https://api.sportmonks.com/v3/football/seasons?api_token=${token}&include=league&filters=seasonLeagues:${encodeURIComponent(leagueIds)}`;
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
    const seasons = list.map((s) => ({
      id: s.id,
      name: s.name ?? "",
      league_id: s.league_id ?? s.league?.id ?? null,
      ...(s.is_current !== undefined && { is_current: s.is_current }),
    }));

    res.status(200).json({
      ok: true,
      source: "sportmonks",
      leagueIds: leagueIds.split(",").map((id) => id.trim()),
      count: seasons.length,
      seasons,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
