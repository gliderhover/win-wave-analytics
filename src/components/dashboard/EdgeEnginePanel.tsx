import { cn } from "@/lib/utils";
import { MatchData } from "@/lib/mockData";
import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EdgeEnginePanel = ({ match }: { match: MatchData }) => {
  const { isPro } = useUserTier();
  const edgeColor = (edge: number) =>
    edge > 3 ? "text-signal-bullish" : edge >= 1 ? "text-signal-neutral" : "text-signal-bearish";
  const edgeBg = (edge: number) =>
    edge > 3 ? "bg-signal-bullish/10" : edge >= 1 ? "bg-signal-neutral/10" : "bg-signal-bearish/10";

  const content = (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Edge Engine</h3>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 rounded-lg p-3 text-center cursor-help">
              <div className="text-xs text-muted-foreground mb-1">Model Prob</div>
              <div className="font-mono text-lg font-bold text-foreground">{match.modelProbA}%</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>AI model's predicted win probability for {match.teamA}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-secondary/50 rounded-lg p-3 text-center cursor-help">
              <div className="text-xs text-muted-foreground mb-1">Market Implied</div>
              <div className="font-mono text-lg font-bold text-muted-foreground">{match.marketProbA}%</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Probability implied by current sportsbook odds</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("rounded-lg p-3 text-center cursor-help", edgeBg(match.edgeA))}>
              <div className="text-xs text-muted-foreground mb-1">Edge %</div>
              <div className={cn("font-mono text-lg font-bold", edgeColor(match.edgeA))}>
                {match.edgeA > 0 ? "+" : ""}{match.edgeA}%
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Edge = Model Probability - Market Implied Probability</TooltipContent>
        </Tooltip>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground font-mono">
          {match.teamA} Edge
        </span>
        <div className={cn("flex items-center gap-1 font-mono font-semibold px-2 py-0.5 rounded", edgeBg(match.edgeA), edgeColor(match.edgeA))}>
          {match.edgeA > 3 ? <TrendingUp className="w-3 h-3" /> : match.edgeA < 1 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {match.edgeA > 3 ? "STRONG" : match.edgeA >= 1 ? "MODERATE" : "WEAK"}
        </div>
      </div>
    </div>
  );

  if (!isPro) {
    return <ProGate label="Unlock Edge Engine Analytics">{content}</ProGate>;
  }

  return content;
};

export default EdgeEnginePanel;
