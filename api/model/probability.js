export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const fixtureId = (req.query.fixtureId ?? "").toString().trim();
  if (!fixtureId) {
    return res.status(400).json({ ok: false, error: "Missing fixtureId" });
  }

  try {
    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const fixtureRes = await fetch(`${baseUrl}/api/fixture?id=${encodeURIComponent(fixtureId)}`);
    const fixtureJson = await fixtureRes.json();
    if (!fixtureRes.ok || !fixtureJson.ok || !fixtureJson.fixture) {
      return res.status(500).json({ ok: false, error: "Failed to load fixture" });
    }

    const f = fixtureJson.fixture;
    const stateId = f.state_id ?? 0;
    const scores = f.scores ?? {};
    const homeScore = Number(scores.home) || 0;
    const awayScore = Number(scores.away) || 0;
    const desc = (scores.description || "").toString();

    let minute = 0;
    const minMatch = desc.match(/(\d{1,3})['']?\s*(?:min|')?/i) || desc.match(/(\d{1,2})/);
    if (minMatch) minute = Math.min(90, Math.max(0, parseInt(minMatch[1], 10)));

    let home = 33;
    let draw = 34;
    let away = 33;

    if (stateId === 2) {
      const scoreDiff = homeScore - awayScore;
      const progress = minute / 90;
      const swing = scoreDiff * (8 + progress * 6);
      home = Math.max(5, Math.min(85, 33 + swing));
      away = Math.max(5, Math.min(85, 33 - swing));
      draw = Math.max(5, Math.min(50, 34 - Math.abs(scoreDiff) * 4));
    } else if (stateId === 3) {
      const scoreDiff = homeScore - awayScore;
      home = Math.max(10, Math.min(90, 33 + scoreDiff * 25));
      away = Math.max(10, Math.min(90, 33 - scoreDiff * 25));
      draw = Math.max(5, Math.min(40, 34 - Math.abs(scoreDiff) * 15));
    }

    const sum = home + draw + away;
    home = Math.round((home / sum) * 100);
    draw = Math.round((draw / sum) * 100);
    away = 100 - home - draw;

    const updatedAt = new Date().toISOString();
    return res.status(200).json({
      ok: true,
      fixtureId,
      home,
      draw,
      away,
      confidence: stateId === 2 ? 75 : stateId === 3 ? 95 : 60,
      volatility: stateId === 2 ? 8 : stateId === 3 ? 2 : 12,
      updatedAt,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
