import { getSnapshots } from "../_snapshots.js";

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const fixtureId = (req.query.fixtureId ?? "").toString().trim();
  const minutesParam = parseInt((req.query.minutes ?? "60").toString(), 10);
  const minutes = Number.isNaN(minutesParam) || minutesParam <= 0 ? 60 : minutesParam;

  if (!fixtureId) {
    return res.status(400).json({ ok: false, error: "Missing fixtureId" });
  }

  try {
    const snapshots = getSnapshots(fixtureId, minutes);
    return res.status(200).json({
      ok: true,
      fixtureId,
      snapshots,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}
