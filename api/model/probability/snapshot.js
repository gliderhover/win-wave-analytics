import { addSnapshot } from "../../../lib/model-snapshots.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const { fixtureId, home, draw, away, ts } = body;

    if (!fixtureId || home == null || draw == null || away == null) {
      return res.status(400).json({ ok: false, error: "Missing required: fixtureId, home, draw, away" });
    }

    addSnapshot({ fixtureId, home, draw, away, ts });
    return res.status(200).json({
      ok: true,
      fixtureId,
      home,
      draw,
      away,
      ts: ts ?? new Date().toISOString(),
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
