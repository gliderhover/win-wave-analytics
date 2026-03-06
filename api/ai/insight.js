export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const apiKey = process.env.AI_insight;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: "Missing AI_insight key" });
  }

  try {
    let body = req.body || {};
    if (typeof body === "string") {
      try {
        body = JSON.parse(body);
      } catch {
        body = {};
      }
    }

    const fixtureId = Number(body.fixtureId);
    if (!fixtureId || Number.isNaN(fixtureId)) {
      return res.status(400).json({ ok: false, error: "Invalid or missing fixtureId" });
    }

    const proto = req.headers["x-forwarded-proto"] || "https";
    const host = req.headers.host;
    const baseUrl = `${proto}://${host}`;

    const fixtureRes = await fetch(`${baseUrl}/api/fixture?id=${encodeURIComponent(String(fixtureId))}`);
    const fixtureJson = await fixtureRes.json();
    if (!fixtureRes.ok || !fixtureJson.ok || !fixtureJson.fixture) {
      return res.status(500).json({ ok: false, error: "Failed to load fixture for insight" });
    }

    const f = fixtureJson.fixture;
    const matchContext = {
      id: f.id,
      leagueName: f.league?.name ?? "",
      leagueId: f.league?.id ?? null,
      starting_at: f.starting_at,
      home: f.home,
      away: f.away,
      state_id: f.state_id ?? null,
    };

    const prompt = `You are an objective football analytics assistant.
Given the match context (JSON) below, write:
1) A concise 2-4 sentence insight about how this match might play out.
2) Three key factors that matter most for understanding this match.
3) A risk level: LOW, MEDIUM, or HIGH (for betting risk).
4) A confidence score from 0 to 100 (integer).

Return ONLY valid JSON matching this schema:
{
  "aiInsight": string,
  "keyFactors": [string, string, string],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "confidence": number
}

Match context:
${JSON.stringify(matchContext, null, 2)}
`;

    const openaiRes = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        input: prompt,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "Insight",
            schema: {
              type: "object",
              properties: {
                aiInsight: { type: "string" },
                keyFactors: {
                  type: "array",
                  items: { type: "string" },
                  minItems: 1,
                  maxItems: 5,
                },
                riskLevel: {
                  type: "string",
                  enum: ["LOW", "MEDIUM", "HIGH"],
                },
                confidence: { type: "number" },
              },
              required: ["aiInsight", "keyFactors", "riskLevel", "confidence"],
              additionalProperties: false,
            },
            strict: true,
          },
        },
      }),
    });

    const openaiJson = await openaiRes.json();
    if (!openaiRes.ok) {
      return res.status(500).json({ ok: false, error: "OpenAI error", details: openaiJson });
    }

    let parsed;
    try {
      // Responses API returns structured JSON under output[0].content[0].text
      const text =
        openaiJson.output?.[0]?.content?.[0]?.text ??
        openaiJson.choices?.[0]?.message?.content ??
        "";
      parsed = typeof text === "string" ? JSON.parse(text) : text;
    } catch {
      parsed = null;
    }

    if (!parsed) {
      return res.status(500).json({ ok: false, error: "Failed to parse OpenAI response" });
    }

    const aiInsight = String(parsed.aiInsight ?? "").trim();
    const keyFactors = Array.isArray(parsed.keyFactors) ? parsed.keyFactors.map(String) : [];
    const riskLevel = ["LOW", "MEDIUM", "HIGH"].includes(parsed.riskLevel)
      ? parsed.riskLevel
      : "MEDIUM";
    const confidence = Number(parsed.confidence ?? 50);

    return res.status(200).json({
      ok: true,
      fixtureId,
      aiInsight,
      keyFactors,
      riskLevel,
      confidence,
    });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
}

