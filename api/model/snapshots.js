/** In-memory snapshot store. Persists across invocations on same instance. */
const store = global.__modelSnapshots || (global.__modelSnapshots = []);

export function addSnapshot({ fixtureId, home, draw, away, ts }) {
  const t = ts ? new Date(ts).getTime() : Date.now();
  store.push({ fixtureId: String(fixtureId), home, draw, away, ts: t });
  return store.length;
}

export function getSnapshots(fixtureId, minutes = 60) {
  const id = String(fixtureId);
  const cutoff = Date.now() - minutes * 60 * 1000;
  return store
    .filter((s) => s.fixtureId === id && s.ts >= cutoff)
    .sort((a, b) => a.ts - b.ts)
    .map((s) => ({ ts: s.ts, home: s.home, draw: s.draw, away: s.away }));
}
