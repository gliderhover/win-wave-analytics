import { useMemo } from "react";
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
import OddsMovementChart from "@/components/dashboard/OddsMovementChart";
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

  const featuredFixture: UiFixture | null = useMemo(() => {
    const list = featuredData?.fixtures ?? [];
    if (list.length === 0) return null;
    const sorted = [...list].sort((a, b) =>
      (a.kickoffIso || "").localeCompare(b.kickoffIso || "")
    );
    return sorted[0];
  }, [featuredData?.fixtures]);

  const selectedMatch = useMemo(() => {
    if (!featuredFixture) return null;
    const base = mockMatches[0];
    return {
      ...base,
      id: featuredFixture.id,
      teamA: featuredFixture.homeTeam || "Home",
      teamB: featuredFixture.awayTeam || "Away",
      kickoff: formatNYDateTimeWithET(featuredFixture.kickoffIso),
    };
  }, [featuredFixture]);

  const matchContext = featuredFixture ? toMatchContextFromUiFixture(featuredFixture) : null;

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
                  <OddsMovementChart match={selectedMatch} full={isPro} />
                  <AIInsight match={selectedMatch} />
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
