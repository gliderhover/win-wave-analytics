import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useI18n } from "@/i18n/I18nContext";
import { leagues } from "@/lib/leagueData";
import { getAllMatches, getTopEdges } from "@/lib/multiLeagueData";
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
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import Navbar from "@/components/Navbar";
import MatchQuickActions from "@/components/MatchQuickActions";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isPro } = useUserTier();
  const { selectedLeague } = useLeague();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [selectedMatch, setSelectedMatch] = useState(mockMatches[0]);

  const leagueLabel = selectedLeague === "all"
    ? t("nav.allLeagues")
    : leagues.find(l => l.id === selectedLeague)?.shortName ?? t("nav.allLeagues");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TopEdgeRibbon />

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
              <LiveGamesPanel onSelectMatch={(id) => {
                const match = mockMatches.find(m => m.id === id);
                if (match) setSelectedMatch(match);
              }} />
              <GameSchedulePanel onSelectMatch={(id) => {
                const match = mockMatches.find(m => m.id === id);
                if (match) setSelectedMatch(match);
              }} />
            </div>

            {/* Match Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {mockMatches.map(match => (
                <button
                  key={match.id}
                  onClick={() => setSelectedMatch(match)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold whitespace-nowrap transition-all",
                    selectedMatch.id === match.id
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  )}
                >
                  <span>{match.flagA}</span>
                  <span>{match.teamA}</span>
                  <span className="text-muted-foreground">{t("common.vs")}</span>
                  <span>{match.teamB}</span>
                  <span>{match.flagB}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Match Header */}
          <div className="gradient-card rounded-xl border border-border p-6 mb-6 group relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{selectedMatch.flagA}</span>
                <div>
                  <div className="text-xl font-bold text-foreground">{selectedMatch.teamA} {t("common.vs")} {selectedMatch.teamB}</div>
                  <div className="text-xs text-muted-foreground font-mono">{selectedMatch.kickoff}</div>
                </div>
                <span className="text-3xl">{selectedMatch.flagB}</span>
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
                  onClick={() => navigate(`/match/${selectedMatch.id}`)}
                  className="text-[10px] font-mono px-3 py-1.5 rounded-md border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  {t("dashboard.matchLab")}
                </button>
                <MatchQuickActions matchId={selectedMatch.id} teamA={selectedMatch.teamA} teamB={selectedMatch.teamB} />
              </div>
            </div>

            {/* Basic Probabilities - FREE */}
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

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <OddsMovementChart match={selectedMatch} full={isPro} />
              <AIInsight match={selectedMatch} />
              <SuggestedBets match={selectedMatch} />
              <EdgeEnginePanel match={selectedMatch} />
              <SmartMoneyDashboard match={selectedMatch} />
            </div>
            <div className="space-y-6">
              <LiveProbabilityPanel match={selectedMatch} />
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
