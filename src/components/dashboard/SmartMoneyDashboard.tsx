import { MatchData } from "@/lib/mockData";
import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";
import { Zap, GitBranch, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SmartMoneyDashboard = ({ match }: { match: MatchData }) => {
  const { isPro } = useUserTier();

  const content = (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-signal-neutral" />
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Smart Money</h3>
      </div>

      <div className="space-y-4">
        {/* Line Movement Velocity */}
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help">Line Velocity</span>
            </TooltipTrigger>
            <TooltipContent>Speed of odds movement — higher values indicate sharp action</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all", match.lineVelocity > 2 ? "bg-signal-bullish" : "bg-muted-foreground")}
                style={{ width: `${Math.min(Math.abs(match.lineVelocity) * 20, 100)}%` }}
              />
            </div>
            <span className={cn("font-mono text-xs font-bold", match.lineVelocity > 2 ? "text-signal-bullish" : "text-muted-foreground")}>
              {match.lineVelocity > 0 ? "+" : ""}{match.lineVelocity}
            </span>
          </div>
        </div>

        {/* Steam Detection */}
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help">Steam Move</span>
            </TooltipTrigger>
            <TooltipContent>Rapid line movement across multiple sportsbooks simultaneously</TooltipContent>
          </Tooltip>
          <span className={cn("text-xs font-mono font-bold px-2 py-0.5 rounded", match.steamDetected ? "text-signal-bearish bg-signal-bearish/10" : "text-muted-foreground bg-secondary")}>
            {match.steamDetected ? "⚡ DETECTED" : "NONE"}
          </span>
        </div>

        {/* Market Divergence */}
        <div className="flex items-center justify-between">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-help">Market Divergence</span>
            </TooltipTrigger>
            <TooltipContent>Gap between sharp and recreational sportsbook pricing</TooltipContent>
          </Tooltip>
          <div className="flex items-center gap-1">
            {Math.abs(match.edgeA) > 3 ? (
              <AlertTriangle className="w-3 h-3 text-signal-neutral" />
            ) : (
              <GitBranch className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={cn("text-xs font-mono font-bold", Math.abs(match.edgeA) > 3 ? "text-signal-neutral" : "text-muted-foreground")}>
              {Math.abs(match.edgeA) > 3 ? "HIGH" : Math.abs(match.edgeA) > 1 ? "MODERATE" : "LOW"}
            </span>
          </div>
        </div>

        {/* Smart Money Direction */}
        <div className="bg-secondary/50 rounded-lg p-3 mt-2">
          <div className="text-xs text-muted-foreground mb-1">Sharp Action</div>
          <div className="text-sm font-semibold text-foreground">{match.smartMoney}</div>
        </div>
      </div>
    </div>
  );

  if (!isPro) {
    return <ProGate label="Unlock Smart Money Signals">{content}</ProGate>;
  }

  return content;
};

export default SmartMoneyDashboard;
