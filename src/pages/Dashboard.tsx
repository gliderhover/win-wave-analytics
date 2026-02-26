import { useState } from "react";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
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
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import Navbar from "@/components/Navbar";
import { cn } from "@/lib/utils";

const Dashboard = () => {
  const { isPro } = useUserTier();
  const [selectedMatch, setSelectedMatch] = useState(mockMatches[0]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TopEdgeRibbon />

      <div className="pt-8 pb-20 px-4">
        <div className="container mx-auto">
          {/* Match Selector */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-4">Dashboard</h1>

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
                  <span className="text-muted-foreground">vs</span>
                  <span>{match.teamB}</span>
                  <span>{match.flagB}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Match Header */}
          <div className="gradient-card rounded-xl border border-border p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{selectedMatch.flagA}</span>
                <div>
                  <div className="text-xl font-bold text-foreground">{selectedMatch.teamA} vs {selectedMatch.teamB}</div>
                  <div className="text-xs text-muted-foreground font-mono">{selectedMatch.kickoff}</div>
                </div>
                <span className="text-3xl">{selectedMatch.flagB}</span>
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-mono font-semibold px-3 py-1 rounded",
                selectedMatch.signal === "bullish" && "text-signal-bullish bg-signal-bullish/10",
                selectedMatch.signal === "bearish" && "text-signal-bearish bg-signal-bearish/10",
                selectedMatch.signal === "neutral" && "text-signal-neutral bg-signal-neutral/10",
              )}>
                {selectedMatch.signal.toUpperCase()}
              </div>
            </div>

            {/* Basic Probabilities - FREE */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{selectedMatch.teamA} Win</div>
                <div className="font-mono text-2xl font-bold text-primary">{selectedMatch.modelProbA}%</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Draw</div>
                <div className="font-mono text-2xl font-bold text-foreground">{selectedMatch.modelProbDraw}%</div>
              </div>
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">{selectedMatch.teamB} Win</div>
                <div className="font-mono text-2xl font-bold text-signal-bearish">{selectedMatch.modelProbB}%</div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              <OddsMovementChart match={selectedMatch} full={isPro} />
              <AIInsight match={selectedMatch} />
              <SuggestedBets match={selectedMatch} />
              <EdgeEnginePanel match={selectedMatch} />
              <SmartMoneyDashboard match={selectedMatch} />
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <LiveProbabilityPanel match={selectedMatch} />
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
