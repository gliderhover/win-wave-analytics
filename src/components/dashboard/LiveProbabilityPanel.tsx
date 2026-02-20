import { MatchData } from "@/lib/mockData";
import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";
import { RefreshCw, Gauge, Activity } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const LiveProbabilityPanel = ({ match }: { match: MatchData }) => {
  const { isPro } = useUserTier();
  const [liveProb, setLiveProb] = useState(match.modelProbA);
  const [lastUpdate, setLastUpdate] = useState("Just now");

  useEffect(() => {
    if (!isPro) return;
    const interval = setInterval(() => {
      setLiveProb(prev => {
        const delta = (Math.random() - 0.48) * 1.5;
        return Math.round((prev + delta) * 10) / 10;
      });
      setLastUpdate("Just now");
    }, 5000);
    return () => clearInterval(interval);
  }, [isPro]);

  const volColor = match.volatility === "high" ? "text-signal-bearish" : match.volatility === "medium" ? "text-signal-neutral" : "text-signal-bullish";

  const content = (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
          <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Live Probability</h3>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">{lastUpdate}</span>
      </div>

      <div className="text-center mb-4">
        <div className="font-mono text-4xl font-black text-foreground">{liveProb}%</div>
        <div className="text-xs text-muted-foreground mt-1">{match.teamA} Win Probability</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 rounded-lg p-3 text-center cursor-help">
              <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="font-mono text-lg font-bold text-foreground">{match.confidence}%</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Model confidence level based on data quality and agreement</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 rounded-lg p-3 text-center cursor-help">
              <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Volatility</div>
              <div className={cn("font-mono text-lg font-bold uppercase", volColor)}>{match.volatility}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Expected price movement — high volatility means bigger swings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );

  if (!isPro) {
    return <ProGate label="Unlock Live Probability Updates">{content}</ProGate>;
  }

  return content;
};

export default LiveProbabilityPanel;
