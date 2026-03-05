export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  const q = (req.query.q ?? "").toString().trim();
  if (!q) {
    return res.status(400).json({ ok: false, error: "Missing required query param: q" });
  }

  try {
    const encodedQuery = encodeURIComponent(q);
    const url = `https://api.sportmonks.com/v3/football/leagues/search/${encodedQuery}?api_token=${token}`;
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
    const leagues = list.map((l) => ({
      id: l.id,
      name: l.name ?? "",
      country_id: l.country_id ?? null,
    }));

    res.status(200).json({
      ok: true,
      q,
      count: leagues.length,
      leagues,
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e), details: null });
  }
}
