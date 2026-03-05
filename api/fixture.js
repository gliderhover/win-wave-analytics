export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  const id = (req.query.id ?? "").toString().trim();
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing required query param: id" });
  }

  try {
    const include = "participants;league;scores;round;stage";
    const url = `https://api.sportmonks.com/v3/football/fixtures/${encodeURIComponent(id)}?api_token=${token}&include=${encodeURIComponent(include)}`;
    const r = await fetch(url);
    const raw = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: "Sportmonks error",
        details: raw,
      });
    }

    const f = raw?.data;
    if (!f) {
      return res.status(404).json({ ok: false, error: "Fixture not found", fixture: null });
    }

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
    const fixture = {
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
    };

    res.status(200).json({
      ok: true,
      fixture,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e), fixture: null });
  }
}
