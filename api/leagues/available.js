export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  try {
    const days = Math.max(1, parseInt(req.query.days ?? "30", 10) || 30);
    const now = new Date();
    const startDate = now.toISOString().slice(0, 10);
    const end = new Date(now);
    end.setUTCDate(end.getUTCDate() + days);
    const endDate = end.toISOString().slice(0, 10);

    const url = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?api_token=${token}&per_page=100&include=league`;
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
    const byLeague = new Map();
    for (const f of list) {
      const league = f.league ?? {};
      const id = league.id;
      if (id == null) continue;
      const existing = byLeague.get(id);
      if (existing) {
        existing.countUpcoming += 1;
      } else {
        byLeague.set(id, {
          id,
          name: league.name ?? "",
          countUpcoming: 1,
        });
      }
    }

    const leagues = Array.from(byLeague.values()).sort(
      (a, b) => (b.countUpcoming ?? 0) - (a.countUpcoming ?? 0)
    );

    res.status(200).json({
      ok: true,
      source: "sportmonks",
      fetchedAt: new Date().toISOString(),
      startDate,
      endDate,
      countLeagues: leagues.length,
      leagues,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
