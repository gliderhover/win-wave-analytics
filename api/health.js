export default async function handler(req, res) {
  const hasKey = !!process.env.SPORTMONKS_API_TOKEN;
  res.status(200).json({
    ok: true,
    sportmonksKeyPresent: hasKey,
    timestamp: new Date().toISOString()
  });
}
