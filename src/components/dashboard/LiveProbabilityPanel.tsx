import { MatchData } from "@/lib/mockData";
import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";
import { RefreshCw, Gauge, Activity } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type LiveProbability = {
  home: number;
  draw: number;
  away: number;
  confidence: number;
  volatility: number;
  updatedAt?: string;
};

const toVolLabel = (v: number) => (v >= 10 ? "high" : v >= 5 ? "medium" : "low");

const LiveProbabilityPanel = ({
  match,
  prob,
  loading = false,
}: {
  match: MatchData;
  prob: LiveProbability | null;
  loading?: boolean;
}) => {
  const { isPro } = useUserTier();

  const liveProb = prob?.home ?? match.modelProbA;
  const conf = prob?.confidence ?? match.confidence;
  const volLabel = toVolLabel(prob?.volatility ?? 8);
  const volColor =
    volLabel === "high"
      ? "text-signal-bearish"
      : volLabel === "medium"
        ? "text-signal-neutral"
        : "text-signal-bullish";
  const lastUpdate = prob?.updatedAt
    ? new Date(prob.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    : "—";

  const content = (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 text-primary animate-spin" style={{ animationDuration: "3s" }} />
          <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Live Probability</h3>
        </div>
        <span className="text-[10px] text-muted-foreground font-mono">
          {loading ? "Updating…" : lastUpdate}
        </span>
      </div>

      <div className="text-center mb-4">
        <div className="font-mono text-4xl font-black text-foreground">{Math.round(liveProb)}%</div>
        <div className="text-xs text-muted-foreground mt-1">{match.teamA} Win Probability</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 rounded-lg p-3 text-center cursor-help">
              <Gauge className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="font-mono text-lg font-bold text-foreground">{Math.round(conf)}%</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Model confidence level based on data quality and agreement</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 rounded-lg p-3 text-center cursor-help">
              <Activity className="w-4 h-4 text-primary mx-auto mb-1" />
              <div className="text-xs text-muted-foreground">Volatility</div>
              <div className={cn("font-mono text-lg font-bold uppercase", volColor)}>{volLabel}</div>
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
