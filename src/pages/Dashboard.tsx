import { useMemo, useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useI18n } from "@/i18n/I18nContext";
import { fetchFixtures, UiFixture } from "@/lib/api";
import { formatNYDateTimeWithET } from "@/lib/time";
import { toMatchContextFromUiFixture } from "@/types/match";
import EdgeEnginePanel from "@/components/dashboard/EdgeEnginePanel";
import SmartMoneyDashboard from "@/components/dashboard/SmartMoneyDashboard";
import LiveProbabilityPanel from "@/components/dashboard/LiveProbabilityPanel";
import AlertsCenter from "@/components/dashboard/AlertsCenter";
import BankrollManager from "@/components/dashboard/BankrollManager";
import SuggestedBets from "@/components/dashboard/SuggestedBets";
import LiveGamesPanel from "@/components/dashboard/LiveGamesPanel";
import GameSchedulePanel from "@/components/dashboard/GameSchedulePanel";
import EliteDDSnapshot from "@/components/dashboard/EliteDDSnapshot";
import Navbar from "@/components/Navbar";
import MatchQuickActions from "@/components/MatchQuickActions";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

const Dashboard = () => {
  const { isPro } = useUserTier();
  const { selectedLeague } = useLeague();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

  // A) Dashboard state
  const [prob, setProb] = useState<{
    home: number;
    draw: number;
    away: number;
    confidence: number;
    volatility: number;
    updatedAt: string;
  } | null>(null);
  const [movement, setMovement] = useState<{ ts: number; home: number; draw: number; away: number }[]>([]);
  const [ai, setAi] = useState<{ aiInsight: string; keyFactors: string[]; riskLevel: "LOW" | "MEDIUM" | "HIGH"; confidence: number } | null>(null);
  const [loadingProb, setLoadingProb] = useState(false);
  const [loadingMove, setLoadingMove] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [errorAI, setErrorAI] = useState<string | null>(null);

  const aiRetryAfterRef = useRef<number>(0);
  const pollProbRef = useRef<number | null>(null);
  const pollMoveRef = useRef<number | null>(null);

  const devLog = (...args: any[]) => {
    if (import.meta.env.DEV) console.log(...args);
  };

  // B) Fetch functions
  const fetchProbability = async (fixtureId: string) => {
    setLoadingProb(true);
    try {
      const res = await fetch(`/api/sports?type=model_probability&fixtureId=${encodeURIComponent(fixtureId)}`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Probability request failed");

      const next = {
        home: Number(json.home ?? 0),
        draw: Number(json.draw ?? 0),
        away: Number(json.away ?? 0),
        confidence: Number(json.confidence ?? 0),
        volatility: Number(json.volatility ?? 0),
        updatedAt: String(json.updatedAt ?? new Date().toISOString()),
      };
      setProb(next);

      // Ensure movement can accumulate: persist a snapshot each time we fetch probability
      fetch("/api/sports?type=model_probability_snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId, home: next.home, draw: next.draw, away: next.away }),
      }).catch(() => {});
    } catch (e) {
      devLog("[dashboard] fetchProbability error", e);
      setProb(null);
    } finally {
      setLoadingProb(false);
    }
  };

  const fetchMovement = async (fixtureId: string) => {
    setLoadingMove(true);
    try {
      const res = await fetch(`/api/sports?type=model_probability_movement&fixtureId=${encodeURIComponent(fixtureId)}&minutes=60`);
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "Movement request failed");
      const snaps = Array.isArray(json.snapshots) ? json.snapshots : [];
      setMovement(
        snaps
          .map((s: any) => ({ ts: Number(s.ts), home: Number(s.home), draw: Number(s.draw), away: Number(s.away) }))
          .filter((s: any) => Number.isFinite(s.ts))
          .sort((a: any, b: any) => a.ts - b.ts)
      );
    } catch (e) {
      devLog("[dashboard] fetchMovement error", e);
      setMovement([]);
    } finally {
      setLoadingMove(false);
    }
  };

  const fetchAIInsight = async (fixtureId: string) => {
    const now = Date.now();
    if (now < aiRetryAfterRef.current) {
      devLog("[dashboard] AI backoff active; skipping");
      return;
    }

    // Optional 1h cache
    try {
      const key = `ai_insight_${fixtureId}`;
      const cachedRaw = localStorage.getItem(key);
      if (cachedRaw) {
        const cached = JSON.parse(cachedRaw);
        if (cached?.ts && now - cached.ts < 60 * 60 * 1000 && cached?.data?.aiInsight) {
          setAi(cached.data);
          setErrorAI(null);
          return;
        }
      }
    } catch {}

    setLoadingAI(true);
    setErrorAI(null);
    try {
      const res = await fetch("/api/sports?type=ai_insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || "AI request failed");

      const next = {
        aiInsight: String(json.aiInsight ?? "").trim(),
        keyFactors: Array.isArray(json.keyFactors) ? json.keyFactors.map(String) : [],
        riskLevel: (["LOW", "MEDIUM", "HIGH"].includes(json.riskLevel) ? json.riskLevel : "MEDIUM") as "LOW" | "MEDIUM" | "HIGH",
        confidence: Number(json.confidence ?? 50),
      };
      setAi(next);

      try {
        localStorage.setItem(`ai_insight_${fixtureId}`, JSON.stringify({ ts: now, data: next }));
      } catch {}
    } catch (e: any) {
      devLog("[dashboard] fetchAIInsight error", e);
      setAi(null);
      setErrorAI("Insight unavailable");
      aiRetryAfterRef.current = Date.now() + 60_000; // backoff 60s on AI failure
    } finally {
      setLoadingAI(false);
    }
  };

  const leagueLabel = useMemo(() => {
    if (selectedLeague === "all") return t("nav.allLeagues");
    if (selectedLeague.startsWith("sm:")) {
      const id = selectedLeague.slice(3);
      if (id === "779") return "Major League Soccer";
      return `League ${id}`;
    }
    return t("nav.allLeagues");
  }, [selectedLeague, t]);

  const { data: featuredData } = useQuery({
    queryKey: ["dashboard-featured-fixtures", selectedLeague],
    queryFn: async () => {
      const params: { leagueIds?: string; all?: boolean; days?: number } = { days: 30 };
      if (selectedLeague === "all") {
        params.all = true;
      } else if (selectedLeague.startsWith("sm:")) {
        params.leagueIds = selectedLeague.slice(3);
      } else {
        params.all = true;
      }
      return fetchFixtures(params);
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const matchOptions: UiFixture[] = useMemo(() => {
    const list = featuredData?.fixtures ?? [];
    if (list.length === 0) return [];
    return [...list].sort((a, b) =>
      (a.kickoffIso || "").localeCompare(b.kickoffIso || "")
    );
  }, [featuredData?.fixtures]);

  const { data: liveData } = useQuery({
    queryKey: ["dashboard-live-fixtures", selectedLeague],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (selectedLeague !== "all" && selectedLeague.startsWith("sm:")) {
        search.set("leagueIds", selectedLeague.slice(3));
      }
      search.set("type", "live");
      const res = await fetch(`/api/sports?${search.toString()}`);
      const json = await res.json();
      if (!json.ok) {
        throw new Error("Failed to load live fixtures");
      }
      return (json.fixtures ?? []) as { id: number | string }[];
    },
    enabled: true,
    staleTime: 10 * 1000,
    retry: 1,
  });

  // When league or options change, choose default selected fixture:
  useEffect(() => {
    if (matchOptions.length === 0) {
      setSelectedFixtureId(null);
      return;
    }
    const liveFirst = (liveData ?? [])[0];
    const candidateId = liveFirst ? String(liveFirst.id) : matchOptions[0].id;
    setSelectedFixtureId(candidateId);
  }, [selectedLeague, liveData, matchOptions]);

  const selectedFixture: UiFixture | null = useMemo(() => {
    if (matchOptions.length === 0) return null;
    if (!selectedFixtureId) return matchOptions[0];
    return matchOptions.find((f) => f.id === selectedFixtureId) ?? matchOptions[0];
  }, [matchOptions, selectedFixtureId]);

  const selectedMatch = useMemo(() => {
    if (!selectedFixture) return null;
    const base = mockMatches[0];
    const teamA = selectedFixture.homeTeam || "Home";
    const teamB = selectedFixture.awayTeam || "Away";
    return {
      ...base,
      id: selectedFixture.id,
      teamA,
      teamB,
      kickoff: formatNYDateTimeWithET(selectedFixture.kickoffIso),
      modelProbA: prob?.home ?? base.modelProbA,
      modelProbDraw: prob?.draw ?? base.modelProbDraw,
      modelProbB: prob?.away ?? base.modelProbB,
    };
  }, [selectedFixture, prob]);

  const matchContext = selectedFixture ? toMatchContextFromUiFixture(selectedFixture) : null;

  // C) useEffect wiring
  useEffect(() => {
    if (!selectedFixtureId) return;

    // Reset state for new fixture
    setMovement([]);
    setErrorAI(null);
    setAi(null);

    fetchProbability(selectedFixtureId);
    fetchMovement(selectedFixtureId);
    fetchAIInsight(selectedFixtureId);

    if (pollProbRef.current) window.clearInterval(pollProbRef.current);
    if (pollMoveRef.current) window.clearInterval(pollMoveRef.current);

    pollProbRef.current = window.setInterval(() => {
      fetchProbability(selectedFixtureId);
    }, 15_000);

    pollMoveRef.current = window.setInterval(() => {
      fetchMovement(selectedFixtureId);
    }, 45_000);

    return () => {
      if (pollProbRef.current) window.clearInterval(pollProbRef.current);
      if (pollMoveRef.current) window.clearInterval(pollMoveRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFixtureId]);

  const chartData = useMemo(() => {
    return movement.map((s) => ({
      time: new Date(s.ts).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      home: s.home,
      draw: s.draw,
      away: s.away,
    }));
  }, [movement]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-[7.5rem] pb-20 px-4">
        <div className="container mx-auto">
          {/* Match Selector */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-4">
              <h1 className="text-2xl font-bold text-foreground">{t("dashboard.title")}</h1>
              <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-1 rounded border border-border">{leagueLabel}</span>
            </div>

            {/* Live Games + Game Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <LiveGamesPanel onSelectMatch={() => {}} />
              <GameSchedulePanel onSelectMatch={() => {}} />
            </div>

            {/* Selected Match */}
            <div className="gradient-card rounded-xl border border-border p-4 flex flex-wrap items-center gap-3">
              <div className="text-sm font-semibold text-foreground">
                Selected Match
              </div>
              {matchOptions.length === 0 ? (
                <div className="text-xs text-muted-foreground">
                  No matches available.
                </div>
              ) : (
                <>
                  <select
                    value={selectedFixtureId ?? matchOptions[0].id}
                    onChange={(e) => setSelectedFixtureId(e.target.value)}
                    className="h-8 px-3 py-1 rounded-md bg-secondary border border-border text-xs text-foreground min-w-[220px] max-w-full"
                  >
                    {matchOptions.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.homeTeam || "Home"} vs {m.awayTeam || "Away"} •{" "}
                        {m.kickoffDate} • {m.kickoffTime} ET
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 text-[10px]">
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-40"
                      onClick={() => {
                        const idx = matchOptions.findIndex(
                          (m) => m.id === selectedFixtureId
                        );
                        if (idx > 0) {
                          setSelectedFixtureId(matchOptions[idx - 1].id);
                        }
                      }}
                      disabled={
                        matchOptions.length === 0 ||
                        matchOptions.findIndex((m) => m.id === selectedFixtureId) <= 0
                      }
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 rounded-md border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground disabled:opacity-40"
                      onClick={() => {
                        const idx = matchOptions.findIndex(
                          (m) => m.id === selectedFixtureId
                        );
                        if (idx >= 0 && idx < matchOptions.length - 1) {
                          setSelectedFixtureId(matchOptions[idx + 1].id);
                        }
                      }}
                      disabled={
                        matchOptions.length === 0 ||
                        matchOptions.findIndex((m) => m.id === selectedFixtureId) ===
                          matchOptions.length - 1
                      }
                    >
                      Next
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Featured Match */}
          {selectedMatch && matchContext && (
            <div className="gradient-card rounded-xl border border-border p-6 mb-6 group relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <span className="text-3xl">⚽</span>
                  <div>
                    <div className="text-xl font-bold text-foreground">
                      {selectedMatch.teamA} {t("common.vs")} {selectedMatch.teamB}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {matchContext.leagueName} • {selectedMatch.kickoff}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-mono font-semibold px-3 py-1 rounded",
                    selectedMatch.signal === "bullish" && "text-signal-bullish bg-signal-bullish/10",
                    selectedMatch.signal === "bearish" && "text-signal-bearish bg-signal-bearish/10",
                    selectedMatch.signal === "neutral" && "text-signal-neutral bg-signal-neutral/10",
                  )}>
                    {selectedMatch.signal.toUpperCase()}
                  </div>
                  <button
                    onClick={() => navigate(`/match/${matchContext.id}`)}
                    className="text-[10px] font-mono px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                  >
                    {t("dashboard.matchLab")}
                  </button>
                  <MatchQuickActions match={matchContext} />
                </div>
              </div>

              {/* Basic Probabilities - FREE (placeholder) */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{selectedMatch.teamA} {t("common.win")}</div>
                  <div className="font-mono text-2xl font-bold text-primary">{prob ? `${prob.home}%` : `${selectedMatch.modelProbA}%`}</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{t("common.draw")}</div>
                  <div className="font-mono text-2xl font-bold text-foreground">{prob ? `${prob.draw}%` : `${selectedMatch.modelProbDraw}%`}</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{selectedMatch.teamB} {t("common.win")}</div>
                  <div className="font-mono text-2xl font-bold text-signal-bearish">{prob ? `${prob.away}%` : `${selectedMatch.modelProbB}%`}</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {selectedMatch && (
                <>
                  {/* D3) WIN-RATE MOVEMENT (wired to movement series) */}
                  <div className="gradient-card rounded-xl border border-border p-5 card-glow">
                    <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">
                      Win-Rate Movement
                    </h3>
                    <div className="h-40">
                      {loadingMove && chartData.length < 2 ? (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                          Collecting win-rate data…
                        </div>
                      ) : chartData.length < 2 ? (
                        <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                          Collecting win-rate data…
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} width={30} />
                            <RTooltip
                              contentStyle={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8, fontSize: 12 }}
                              labelStyle={{ color: "hsl(210 40% 93%)" }}
                            />
                            <Line type="monotone" dataKey="home" stroke="hsl(175 85% 50%)" strokeWidth={2} dot={false} name={selectedMatch.teamA} />
                            <Line type="monotone" dataKey="draw" stroke="hsl(45 93% 55%)" strokeWidth={2} dot={false} name="Draw" />
                            <Line type="monotone" dataKey="away" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={false} name={selectedMatch.teamB} />
                          </LineChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  {/* D4) AI INSIGHT (wired to ai state) */}
                  <div className="gradient-card rounded-xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm">🤖</span>
                      <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
                        AI Insight
                      </h3>
                    </div>

                    {loadingAI ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-secondary/60 rounded animate-pulse" />
                        <div className="h-4 bg-secondary/60 rounded animate-pulse w-5/6" />
                        <div className="h-4 bg-secondary/60 rounded animate-pulse w-3/4" />
                      </div>
                    ) : ai?.aiInsight ? (
                      <>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {ai.aiInsight}
                        </p>
                        {ai.keyFactors?.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                            {ai.keyFactors.map((f, idx) => (
                              <li key={idx}>{f}</li>
                            ))}
                          </ul>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {errorAI ?? "Insight unavailable."}
                      </p>
                    )}
                  </div>

                  <SuggestedBets match={selectedMatch} />
                  <EdgeEnginePanel match={selectedMatch} />
                  <SmartMoneyDashboard match={selectedMatch} />
                </>
              )}
            </div>
            <div className="space-y-6">
              {selectedMatch && (
                <LiveProbabilityPanel match={selectedMatch} prob={prob} loading={loadingProb} />
              )}
              <EliteDDSnapshot />
              <AlertsCenter />
              <BankrollManager />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
