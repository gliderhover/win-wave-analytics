export default async function handler(req, res) {
  try {
    const token = process.env.SPORTMONKS_API_TOKEN;
    if (!token) return res.status(500).json({ error: "Missing SPORTMONKS_API_TOKEN" });

    // You can start simple: just fetch a small list of fixtures.
    // You will replace this URL once you choose the exact Sportmonks endpoint & params you want.
    const url = `https://api.sportmonks.com/v3/football/fixtures?api_token=${token}&per_page=5`;

    const r = await fetch(url);
    const data = await r.json();

    res.status(200).json({
      ok: true,
      source: "sportmonks",
      fetchedAt: new Date().toISOString(),
      data
    });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
}
