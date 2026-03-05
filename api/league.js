export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const token = process.env.SPORTMONKS_API_TOKEN;
  if (!token) {
    return res.status(500).json({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" });
  }

  const id = (req.query.id ?? "").toString().trim();
  if (!id) {
    return res.status(400).json({ ok: false, error: "Missing required query param: id" });
  }

  try {
    const url = `https://api.sportmonks.com/v3/football/leagues/${encodeURIComponent(id)}?api_token=${token}`;
    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: "Sportmonks error",
        details: data,
      });
    }

    res.status(200).json({
      ok: true,
      league: data.data ?? null,
      fetchedAt: new Date().toISOString(),
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e), details: null });
  }
}
