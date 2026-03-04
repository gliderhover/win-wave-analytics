export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.status(200).json({
    ok: true,
    leagues: [
      { id: 732, name: "World Cup" },
      { id: 2, name: "UEFA Champions League" },
      { id: 8, name: "Premier League" },
      { id: 564, name: "La Liga" },
      { id: 384, name: "Serie A" },
      { id: 5, name: "Europa League" },
    ],
  });
}
