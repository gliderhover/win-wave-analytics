import { useMemo, useState, useEffect } from "react";
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
import WinRateMovementChart from "@/components/dashboard/WinRateMovementChart";
import AIInsight from "@/components/dashboard/AIInsight";
import SuggestedBets from "@/components/dashboard/SuggestedBets";
import LiveGamesPanel from "@/components/dashboard/LiveGamesPanel";
import GameSchedulePanel from "@/components/dashboard/GameSchedulePanel";
import EliteDDSnapshot from "@/components/dashboard/EliteDDSnapshot";
import Navbar from "@/components/Navbar";
import MatchQuickActions from "@/components/MatchQuickActions";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isPro } = useUserTier();
  const { selectedLeague } = useLeague();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [selectedFixtureId, setSelectedFixtureId] = useState<string | null>(null);

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

  const { data: probData } = useQuery({
    queryKey: ["model-probability", selectedFixtureId],
    queryFn: async () => {
      const res = await fetch(`/api/sports?type=model_probability&fixtureId=${encodeURIComponent(selectedFixtureId!)}`);
      const json = await res.json();
      if (!json.ok) throw new Error("Failed to fetch probability");
      return json as { home: number; draw: number; away: number };
    },
    enabled: !!selectedFixtureId,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });

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
      modelProbA: probData?.home ?? base.modelProbA,
      modelProbDraw: probData?.draw ?? base.modelProbDraw,
      modelProbB: probData?.away ?? base.modelProbB,
    };
  }, [selectedFixture, probData]);

  const matchContext = selectedFixture ? toMatchContextFromUiFixture(selectedFixture) : null;

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
                  <div className="font-mono text-2xl font-bold text-primary">{selectedMatch.modelProbA}%</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{t("common.draw")}</div>
                  <div className="font-mono text-2xl font-bold text-foreground">{selectedMatch.modelProbDraw}%</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-3 text-center">
                  <div className="text-xs text-muted-foreground mb-1">{selectedMatch.teamB} {t("common.win")}</div>
                  <div className="font-mono text-2xl font-bold text-signal-bearish">{selectedMatch.modelProbB}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {selectedMatch && (
                <>
                  <WinRateMovementChart
                    fixtureId={selectedFixtureId}
                    teamA={selectedMatch.teamA}
                    teamB={selectedMatch.teamB}
                    isLive={
                      !!(liveData ?? []).some(
                        (f) => String(f.id) === selectedFixtureId
                      )
                    }
                    full={isPro}
                  />
                  <AIInsight match={selectedMatch} fixtureId={matchContext?.id} />
                  <SuggestedBets match={selectedMatch} />
                  <EdgeEnginePanel match={selectedMatch} />
                  <SmartMoneyDashboard match={selectedMatch} />
                </>
              )}
            </div>
            <div className="space-y-6">
              {selectedMatch && <LiveProbabilityPanel match={selectedMatch} />}
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
