/**
 * Unified API handler - consolidates all endpoints to stay under Vercel Hobby limit (12 functions).
 * Route via ?type=... (GET) or POST body { type, ... }.
 */
import { addSnapshot, getSnapshots } from "../lib/model-snapshots.js";

const MAX_DAYS = 100;

function capDays(val) {
  const n = parseInt(val ?? "30", 10);
  return Number.isNaN(n) || n <= 0 ? 30 : Math.max(1, Math.min(n, MAX_DAYS));
}

async function fetchFixtureDirect(token, id) {
  const include = "participants;league;scores;round;stage";
  const url = `https://api.sportmonks.com/v3/football/fixtures/${encodeURIComponent(id)}?api_token=${token}&include=${encodeURIComponent(include)}`;
  const r = await fetch(url);
  const raw = await r.json();
  if (!r.ok || !raw?.data) return null;
  const f = raw.data;
  const participants = f.participants ?? [];
  let home = null, away = null;
  const byLoc = participants.find((p) => p.meta?.location === "home");
  const awayByLoc = participants.find((p) => p.meta?.location === "away");
  if (byLoc && awayByLoc) {
    home = { id: byLoc.id, name: byLoc.name ?? byLoc.short_code ?? "" };
    away = { id: awayByLoc.id, name: awayByLoc.name ?? awayByLoc.short_code ?? "" };
  } else if (participants.length >= 2) {
    home = { id: participants[0].id, name: participants[0].name ?? participants[0].short_code ?? "" };
    away = { id: participants[1].id, name: participants[1].name ?? participants[1].short_code ?? "" };
  }
  const league = f.league ?? {};
  const scoresRaw = Array.isArray(f.scores) ? f.scores : [];
  const liveScore = scoresRaw.find((s) => s.score_type === "live") || scoresRaw.find((s) => s.score_type === "current") || scoresRaw[0];
  const scores = liveScore ? { home: liveScore.home_score ?? null, away: liveScore.away_score ?? null, description: liveScore.description ?? null } : null;
  return {
    id: f.id, starting_at: f.starting_at, state_id: f.state_id ?? null,
    league: { id: league.id, name: league.name ?? "", season_id: league.season_id ?? null },
    home, away, scores,
  };
}

function mapFixture(f) {
  const participants = f.participants ?? [];
  let home = null, away = null;
  const byLocation = participants.find((p) => p.meta?.location === "home");
  const awayByLoc = participants.find((p) => p.meta?.location === "away");
  if (byLocation && awayByLoc) {
    home = { id: byLocation.id, name: byLocation.name ?? byLocation.short_code ?? "" };
    away = { id: awayByLoc.id, name: awayByLoc.name ?? awayByLoc.short_code ?? "" };
  } else if (participants.length >= 2) {
    home = { id: participants[0].id, name: participants[0].name ?? participants[0].short_code ?? "" };
    away = { id: participants[1].id, name: participants[1].name ?? participants[1].short_code ?? "" };
  }
  const league = f.league ?? {};
  return {
    id: f.id, starting_at: f.starting_at, state_id: f.state_id,
    league: { id: league.id, name: league.name ?? "", season_id: league.season_id ?? null },
    home, away,
  };
}

export default async function handler(req, res) {
  res.setHeader("Content-Type", "application/json");

  const token = process.env.SPORTMONKS_API_TOKEN;
  const aiKey = process.env.AI_insight || process.env.OPENAI_API_KEY;

  const isPost = req.method === "POST";
  const q = req.query || {};
  let body = {};
  if (isPost) {
    body = typeof req.body === "string" ? (() => { try { return JSON.parse(req.body || "{}"); } catch { return {}; } })() : req.body || {};
  }
  const type = (q.type ?? body.type ?? "").toString().trim();

  const send = (data, status = 200) => {
    const out = { ...data };
    if (out.debugUrl && token) out.debugUrl = out.debugUrl.replace(token, "[REDACTED]");
    if (out.details?.api_token) out.details.api_token = "[REDACTED]";
    res.status(status).json(out);
  };

  try {
    switch (type) {
      case "health": {
        res.setHeader("Cache-Control", "s-maxage=60");
        return send({ ok: true, sportmonksKeyPresent: !!token, timestamp: new Date().toISOString() });
      }

      case "fixtures": {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const leagueIdsParam = (q.leagueIds ?? "732,2,8,564,384").toString().trim();
        let leagueIds = leagueIdsParam ? leagueIdsParam.split(",").map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n)) : [732, 2, 8, 564, 384];
        const days = capDays(q.days);
        const rawMode = (q.raw ?? "").toString().toLowerCase() === "true";
        const debugUrlFlag = (q.debugUrl ?? "").toString().toLowerCase() === "true";
        const debugAll = (q.all ?? "").toString().toLowerCase() === "true";
        const includeEuropa = (q.includeEuropa ?? "false").toString().toLowerCase() === "true";
        if (includeEuropa && !leagueIds.includes(5)) leagueIds = [...leagueIds, 5];
        leagueIds = [...new Set(leagueIds)];

        const now = new Date();
        const startDate = now.toISOString().slice(0, 10);
        const end = new Date(now);
        end.setUTCDate(end.getUTCDate() + days);
        const endDate = end.toISOString().slice(0, 10);

        const includeAll = "participants;league;scores";
        const includeFiltered = "participants;league;scores;round;stage";
        const include = debugAll ? includeAll : includeFiltered;
        const baseNoToken = `https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?per_page=50&include=${encodeURIComponent(include)}`;
        const base = `${baseNoToken}&api_token=${token}`;
        const url = debugAll ? base : `${base}&filters=fixtureLeagues:${encodeURIComponent(leagueIds.join(","))}`;
        const debugUrlValue = debugUrlFlag ? (debugAll ? baseNoToken : `${baseNoToken}&filters=fixtureLeagues:${encodeURIComponent(leagueIds.join(","))}`) : undefined;

        const r = await fetch(url);
        const raw = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: raw }, r.status);

        const list = Array.isArray(raw?.data) ? raw.data : [];
        const fixtures = list.map(mapFixture).sort((a, b) => (a.starting_at || "").localeCompare(b.starting_at || ""));

        if (rawMode) {
          const payload = {
            ok: true, raw: true, fetchedAt: new Date().toISOString(), startDate, endDate, leagueIds,
            daysRequested: parseInt(q.days ?? "30", 10) || 30, daysUsed: days, apiCount: list.length,
            sample: list.slice(0, 5).map((f) => ({ id: f.id, name: f.name ?? null, starting_at: f.starting_at })),
            count: Math.min(20, fixtures.length), fixtures: fixtures.slice(0, 20),
          };
          if (debugUrlValue) payload.debugUrl = debugUrlValue;
          return send(payload);
        }
        const payload = { ok: true, source: "sportmonks", fetchedAt: new Date().toISOString(), startDate, endDate, leagueIds, daysRequested: parseInt(q.days ?? "30", 10) || 30, daysUsed: days, count: fixtures.length, fixtures };
        if (debugAll) payload.debugAll = true;
        if (debugUrlValue) payload.debugUrl = debugUrlValue;
        return send(payload);
      }

      case "live": {
        res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const leagueIdsParam = (q.leagueIds ?? "").toString().trim();
        const minutesParam = parseInt((q.minutes ?? "30").toString(), 10);
        const minutes = Number.isNaN(minutesParam) || minutesParam <= 0 ? 30 : minutesParam;

        const url = `https://api.sportmonks.com/v3/football/livescores/inplay?api_token=${token}&include=${encodeURIComponent("participants;league;scores")}`;
        const r = await fetch(url);
        const raw = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: raw }, r.status);

        let list = Array.isArray(raw?.data) ? raw.data : [];
        if (leagueIdsParam) {
          const allowedSet = new Set(leagueIdsParam.split(",").map((id) => parseInt(id, 10)).filter((n) => !Number.isNaN(n)));
          list = list.filter((f) => allowedSet.has(f.league_id ?? f.league?.id));
        }

        const now = new Date();
        const cutoffMs = minutes * 60 * 1000;
        const fixtures = list.map((f) => {
          const participants = f.participants ?? [];
          let home = null, away = null;
          const byH = participants.find((p) => p.meta?.location === "home");
          const byA = participants.find((p) => p.meta?.location === "away");
          if (byH && byA) {
            home = { id: byH.id, name: byH.name ?? byH.short_code ?? "" };
            away = { id: byA.id, name: byA.name ?? byA.short_code ?? "" };
          } else if (participants.length >= 2) {
            home = { id: participants[0].id, name: participants[0].name ?? participants[0].short_code ?? "" };
            away = { id: participants[1].id, name: participants[1].name ?? participants[1].short_code ?? "" };
          }
          const scores = Array.isArray(f.scores) ? f.scores : [];
          const liveScore = scores.find((s) => s.score_type === "live") || scores.find((s) => s.score_type === "current") || scores[0];
          const currentScore = liveScore ? { home: liveScore.home_score ?? null, away: liveScore.away_score ?? null, description: liveScore.description ?? null } : null;
          return {
            id: f.id, starting_at: f.starting_at, state_id: f.state_id ?? null,
            league: { id: f.league?.id, name: f.league?.name ?? "", season_id: f.league?.season_id ?? null },
            home, away, scores: currentScore,
          };
        });

        const filtered = fixtures.filter((fx) => {
          if (!fx.starting_at) return true;
          const dt = new Date(fx.starting_at.replace(" ", "T") + "Z");
          if (Number.isNaN(dt.getTime())) return true;
          const diff = now.getTime() - dt.getTime();
          return diff >= 0 && diff <= cutoffMs;
        });
        filtered.sort((a, b) => (a.starting_at || "").localeCompare(b.starting_at || ""));
        return send({ ok: true, fetchedAt: new Date().toISOString(), count: filtered.length, fixtures: filtered });
      }

      case "fixture": {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const id = (q.id ?? "").toString().trim();
        if (!id) return send({ ok: false, error: "Missing required query param: id" }, 400);
        const fixture = await fetchFixtureDirect(token, id);
        if (!fixture) return send({ ok: false, error: "Fixture not found", fixture: null }, 404);
        return send({ ok: true, fixture, fetchedAt: new Date().toISOString() });
      }

      case "league": {
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const id = (q.id ?? "").toString().trim();
        if (!id) return send({ ok: false, error: "Missing required query param: id" }, 400);
        const r = await fetch(`https://api.sportmonks.com/v3/football/leagues/${encodeURIComponent(id)}?api_token=${token}`);
        const data = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: data }, r.status);
        return send({ ok: true, league: data.data ?? null, fetchedAt: new Date().toISOString() });
      }

      case "leagues_available": {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const days = capDays(q.days);
        const now = new Date();
        const startDate = now.toISOString().slice(0, 10);
        const end = new Date(now);
        end.setUTCDate(end.getUTCDate() + days);
        const endDate = end.toISOString().slice(0, 10);

        const r = await fetch(`https://api.sportmonks.com/v3/football/fixtures/between/${startDate}/${endDate}?api_token=${token}&per_page=100&include=league`);
        const raw = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: raw }, r.status);

        const list = Array.isArray(raw?.data) ? raw.data : [];
        const byLeague = new Map();
        for (const f of list) {
          const league = f.league ?? {};
          const id = league.id;
          if (id == null) continue;
          const ex = byLeague.get(id);
          if (ex) ex.countUpcoming += 1;
          else byLeague.set(id, { id, name: league.name ?? "", countUpcoming: 1 });
        }
        const leagues = Array.from(byLeague.values()).sort((a, b) => (b.countUpcoming ?? 0) - (a.countUpcoming ?? 0));
        return send({ ok: true, source: "sportmonks", fetchedAt: new Date().toISOString(), startDate, endDate, countLeagues: leagues.length, leagues });
      }

      case "leagues_top": {
        return send({
          ok: true,
          note: "If a league returns no fixtures, it may not be included in your Sportmonks plan. Use type=leagues_available to see accessible leagues.",
          leagues: [
            { id: 732, name: "World Cup" }, { id: 2, name: "UEFA Champions League" }, { id: 8, name: "Premier League" },
            { id: 564, name: "La Liga" }, { id: 384, name: "Serie A" }, { id: 5, name: "Europa League" },
          ],
        });
      }

      case "leagues_search": {
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const qq = (q.q ?? "").toString().trim();
        if (!qq) return send({ ok: false, error: "Missing required query param: q" }, 400);
        const r = await fetch(`https://api.sportmonks.com/v3/football/leagues/search/${encodeURIComponent(qq)}?api_token=${token}`);
        const raw = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: raw }, r.status);
        const list = Array.isArray(raw?.data) ? raw.data : [];
        const leagues = list.map((l) => ({ id: l.id, name: l.name ?? "", country_id: l.country_id ?? null }));
        return send({ ok: true, q: qq, count: leagues.length, leagues });
      }

      case "fixtures_season": {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const seasonId = (q.seasonId ?? "").toString().trim();
        if (!seasonId) return send({ ok: false, error: "Missing required query param: seasonId" }, 400);
        const r = await fetch(`https://api.sportmonks.com/v3/football/fixtures/seasons/${encodeURIComponent(seasonId)}?api_token=${token}&include=${encodeURIComponent("participants;league;scores")}`);
        const raw = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: raw }, r.status);
        const nowIso = new Date().toISOString();
        const list = Array.isArray(raw?.data) ? raw.data : [];
        const upcoming = list.filter((f) => (f.starting_at || "") >= nowIso);
        const fixtures = upcoming.map(mapFixture).sort((a, b) => (a.starting_at || "").localeCompare(b.starting_at || ""));
        return send({ ok: true, source: "sportmonks", seasonId, fetchedAt: new Date().toISOString(), count: fixtures.length, fixtures });
      }

      case "seasons": {
        res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);
        const leagueIdsParam = (q.leagueIds ?? "779").toString().trim();
        const leagueIds = leagueIdsParam || "779";
        const r = await fetch(`https://api.sportmonks.com/v3/football/seasons?api_token=${token}&include=league&filters=seasonLeagues:${encodeURIComponent(leagueIds)}`);
        const raw = await r.json();
        if (!r.ok) return send({ ok: false, error: "Sportmonks error", details: raw }, r.status);
        const list = Array.isArray(raw?.data) ? raw.data : [];
        const seasons = list.map((s) => ({ id: s.id, name: s.name ?? "", league_id: s.league_id ?? s.league?.id ?? null, ...(s.is_current !== undefined && { is_current: s.is_current }) }));
        return send({ ok: true, source: "sportmonks", leagueIds: leagueIds.split(",").map((id) => id.trim()), count: seasons.length, seasons });
      }

      case "ai_insight": {
        res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
        if (req.method !== "POST") return res.status(405).setHeader("Allow", "POST").json({ ok: false, error: "Method not allowed" });
        const fixtureIdRaw = (body.fixtureId ?? "").toString().trim();
        if (!fixtureIdRaw) return send({ ok: false, error: "Invalid or missing fixtureId" }, 400);

        // Best-effort match context. If SPORTMONKS_API_TOKEN is missing, we still return a usable response.
        let matchContext = { id: fixtureIdRaw };
        if (token) {
          const f = await fetchFixtureDirect(token, fixtureIdRaw);
          if (f) {
            matchContext = {
              id: String(f.id),
              leagueName: f.league?.name ?? "",
              leagueId: f.league?.id ?? null,
              starting_at: f.starting_at,
              home: f.home,
              away: f.away,
              state_id: f.state_id ?? null,
              scores: f.scores ?? null,
            };
          }
        }

        // If no OpenAI key is configured, provide a deterministic fallback so the Dashboard still works.
        if (!aiKey) {
          const homeName = matchContext.home?.name ?? "Home";
          const awayName = matchContext.away?.name ?? "Away";
          const score = matchContext.scores ? `${matchContext.scores.home ?? 0}-${matchContext.scores.away ?? 0}` : null;
          const state = matchContext.state_id === 2 ? "LIVE" : matchContext.state_id === 3 ? "FINISHED" : "SCHEDULED";
          const aiInsight =
            state === "LIVE"
              ? `Live match: ${homeName} vs ${awayName} (${score ?? "score n/a"}). Momentum and game state can swing quickly — treat any edge as short-lived.`
              : state === "FINISHED"
                ? `Final: ${homeName} vs ${awayName}${score ? ` (${score})` : ""}. Use the post-match stats and events to evaluate whether the result matches expectations.`
                : `Upcoming: ${homeName} vs ${awayName}. Early information (lineups, injuries, travel, rest) tends to move confidence most.`;

          return send({
            ok: true,
            fixtureId: fixtureIdRaw,
            aiInsight,
            keyFactors: [
              "Game state (scheduled/live/final)",
              "Scoreline and time remaining (if live)",
              "Lineups/injuries and schedule congestion",
            ],
            riskLevel: state === "LIVE" ? "HIGH" : "MEDIUM",
            confidence: state === "FINISHED" ? 90 : 55,
            fallback: true,
          });
        }

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
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
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
                    keyFactors: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5 },
                    riskLevel: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
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
        if (!openaiRes.ok) return send({ ok: false, error: "OpenAI error", details: openaiJson }, 500);

        let parsed;
        try {
          const text = openaiJson.output?.[0]?.content?.[0]?.text ?? openaiJson.choices?.[0]?.message?.content ?? "";
          parsed = typeof text === "string" ? JSON.parse(text) : text;
        } catch {
          parsed = null;
        }
        if (!parsed) return send({ ok: false, error: "Failed to parse OpenAI response" }, 500);

        const aiInsight = String(parsed.aiInsight ?? "").trim();
        const keyFactors = Array.isArray(parsed.keyFactors) ? parsed.keyFactors.map(String) : [];
        const riskLevel = ["LOW", "MEDIUM", "HIGH"].includes(parsed.riskLevel) ? parsed.riskLevel : "MEDIUM";
        const confidence = Number(parsed.confidence ?? 50);
        return send({ ok: true, fixtureId: fixtureIdRaw, aiInsight, keyFactors, riskLevel, confidence });
      }

      case "model_probability": {
        res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
        if (req.method !== "GET") return res.status(405).setHeader("Allow", "GET").json({ ok: false, error: "Method not allowed" });
        const fixtureId = (q.fixtureId ?? "").toString().trim();
        if (!fixtureId) return send({ ok: false, error: "Missing fixtureId" }, 400);
        if (!token) return send({ ok: false, error: "Missing SPORTMONKS_API_TOKEN" }, 500);

        const f = await fetchFixtureDirect(token, fixtureId);
        if (!f) return send({ ok: false, error: "Failed to load fixture" }, 500);

        const stateId = f.state_id ?? 0;
        const scores = f.scores ?? {};
        const homeScore = Number(scores.home) || 0;
        const awayScore = Number(scores.away) || 0;
        const desc = (scores.description || "").toString();
        let minute = 0;
        const minMatch = desc.match(/(\d{1,3})['']?\s*(?:min|')?/i) || desc.match(/(\d{1,2})/);
        if (minMatch) minute = Math.min(90, Math.max(0, parseInt(minMatch[1], 10)));

        let home = 33, draw = 34, away = 33;
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
        return send({ ok: true, fixtureId, home, draw, away, confidence: stateId === 2 ? 75 : stateId === 3 ? 95 : 60, volatility: stateId === 2 ? 8 : stateId === 3 ? 2 : 12, updatedAt: new Date().toISOString() });
      }

      case "model_probability_snapshot": {
        if (req.method !== "POST") return res.status(405).setHeader("Allow", "POST").json({ ok: false, error: "Method not allowed" });
        const { fixtureId, home, draw, away, ts } = body;
        if (!fixtureId || home == null || draw == null || away == null) return send({ ok: false, error: "Missing required: fixtureId, home, draw, away" }, 400);
        addSnapshot({ fixtureId, home, draw, away, ts });
        return send({ ok: true, fixtureId, home, draw, away, ts: ts ?? new Date().toISOString() });
      }

      case "model_probability_movement": {
        res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");
        if (req.method !== "GET") return res.status(405).setHeader("Allow", "GET").json({ ok: false, error: "Method not allowed" });
        const fixtureId = (q.fixtureId ?? "").toString().trim();
        const minutesParam = parseInt((q.minutes ?? "60").toString(), 10);
        const minutes = Number.isNaN(minutesParam) || minutesParam <= 0 ? 60 : minutesParam;
        if (!fixtureId) return send({ ok: false, error: "Missing fixtureId" }, 400);
        const snapshots = getSnapshots(fixtureId, minutes);
        return send({ ok: true, fixtureId, snapshots });
      }

      default:
        return send({ ok: false, error: "Missing or invalid type. Use ?type=fixtures|live|fixture|league|leagues_available|leagues_top|leagues_search|fixtures_season|seasons|health|ai_insight|model_probability|model_probability_snapshot|model_probability_movement" }, 400);
    }
  } catch (e) {
    return send({ ok: false, error: String(e) }, 500);
  }
}
