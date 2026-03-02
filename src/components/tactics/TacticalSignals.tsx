import { TacticalSignal } from "@/lib/tacticsData";
import { useUserTier } from "@/contexts/UserTierContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface TacticalSignalsProps {
  signals: TacticalSignal[];
}

const TacticalSignals = ({ signals }: TacticalSignalsProps) => {
  const { isElite } = useUserTier();

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-mono font-semibold text-foreground">TACTICAL BETTING SIGNALS</h4>

      <div className="space-y-2">
        {signals.map((sig, i) => {
          const isLocked = sig.eliteOnly && !isElite;

          return (
            <div key={i} className={cn(
              "bg-secondary/30 border border-border rounded-lg p-3 transition-colors",
              isLocked && "opacity-50"
            )}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">{sig.icon}</span>
                <span className="text-xs font-mono font-semibold text-foreground flex-1">{sig.name}</span>
                {isLocked && <Lock className="w-3 h-3 text-muted-foreground" />}
                <Tooltip>
                  <TooltipTrigger>
                    <span className={cn(
                      "text-xs font-mono font-bold px-2 py-0.5 rounded",
                      sig.score >= 70 ? "text-accent bg-accent/10" : sig.score >= 40 ? "text-warning bg-warning/10" : "text-destructive bg-destructive/10"
                    )}>
                      {sig.score}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px]">
                    <p className="font-semibold text-xs mb-1">Why this score?</p>
                    <ul className="space-y-0.5">
                      {sig.explanation.map((e, j) => (
                        <li key={j} className="text-[10px] text-muted-foreground">• {e}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </div>

              <Progress value={sig.score} className="h-1 mb-2" />

              {/* Impact tags */}
              <div className="flex flex-wrap gap-1">
                {sig.impactTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-[8px] px-1.5 py-0 h-4">
                    {tag}
                  </Badge>
                ))}
                {sig.eliteOnly && !isElite && (
                  <Badge className="text-[8px] px-1.5 py-0 h-4 bg-primary/20 text-primary border-primary/30">
                    Elite
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TacticalSignals;
