import Navbar from "@/components/Navbar";
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import ProGate from "@/components/ProGate";
import OddsMovementChart from "@/components/dashboard/OddsMovementChart";
import AIInsight from "@/components/dashboard/AIInsight";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const Matches = () => {
  const { isPro } = useUserTier();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TopEdgeRibbon />

      <div className="pt-8 pb-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">Matches</h1>

          <div className="space-y-6">
            {mockMatches.map((match, i) => {
              const SignalIcon = match.signal === "bullish" ? TrendingUp : match.signal === "bearish" ? TrendingDown : Minus;
              // Free users see only 1 full match
              const isLocked = !isPro && i > 0;

              const card = (
                <div key={match.id} className="gradient-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{match.flagA}</span>
                      <span className="text-lg font-bold text-foreground">{match.teamA}</span>
                      <span className="text-muted-foreground text-sm">vs</span>
                      <span className="text-lg font-bold text-foreground">{match.teamB}</span>
                      <span className="text-2xl">{match.flagB}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{match.kickoff}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded",
                        match.signal === "bullish" && "text-signal-bullish bg-signal-bullish/10",
                        match.signal === "bearish" && "text-signal-bearish bg-signal-bearish/10",
                        match.signal === "neutral" && "text-signal-neutral bg-signal-neutral/10",
                      )}>
                        <SignalIcon className="w-3 h-3" />
                        {match.signal.toUpperCase()}
                      </div>
                    </div>
                  </div>

                  {/* Probability Bar */}
                  <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                    <div className="bg-primary rounded-l-full" style={{ width: `${match.modelProbA}%` }} />
                    <div className="bg-muted-foreground/40" style={{ width: `${match.modelProbDraw}%` }} />
                    <div className="bg-signal-bearish rounded-r-full" style={{ width: `${match.modelProbB}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-muted-foreground mb-4">
                    <span className="text-primary">{match.teamA} {match.modelProbA}%</span>
                    <span>Draw {match.modelProbDraw}%</span>
                    <span className="text-signal-bearish">{match.teamB} {match.modelProbB}%</span>
                  </div>

                  {/* Edge Preview - blurred for free */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <OddsMovementChart match={match} full={isPro && !isLocked} />
                    <AIInsight match={match} />
                  </div>
                </div>
              );

              if (isLocked) {
                return (
                  <ProGate key={match.id} label="Unlock All Match Analytics">
                    {card}
                  </ProGate>
                );
              }

              return <div key={match.id}>{card}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
