import { MatchTacticalSignals } from "@/lib/tacticsData";
import { useUserTier } from "@/contexts/UserTierContext";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface LineupVolatilityProps {
  data: MatchTacticalSignals["lineupVolatility"];
  lastUpdate: string;
}

const LineupVolatility = ({ data, lastUpdate }: LineupVolatilityProps) => {
  const { isElite } = useUserTier();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-semibold text-foreground">LINEUP RISK</h4>
        <div className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground">Updated {lastUpdate}</span>
          <button className="text-[9px] font-mono text-primary hover:underline">↻ Refresh</button>
        </div>
      </div>

      {/* Uncertainty score */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "text-2xl font-mono font-bold",
          data.score >= 60 ? "text-destructive" : data.score >= 35 ? "text-warning" : "text-accent"
        )}>
          {data.score}
        </div>
        <div className="flex-1">
          <Progress value={data.score} className="h-2" />
          <p className="text-[9px] text-muted-foreground mt-0.5">
            {data.score >= 60 ? "High uncertainty" : data.score >= 35 ? "Moderate uncertainty" : "Low uncertainty"}
          </p>
        </div>
      </div>

      {/* Drivers */}
      <div>
        <h5 className="text-[10px] font-mono text-muted-foreground mb-1">DRIVERS</h5>
        <ul className="space-y-0.5">
          {data.drivers.map((d, i) => (
            <li key={i} className="text-[10px] text-foreground/80 flex items-start gap-1.5">
              <span className="text-warning mt-0.5">⚠</span> {d}
            </li>
          ))}
        </ul>
      </div>

      {/* Scenarios (Elite) */}
      {isElite && data.scenarios.length > 0 && (
        <div>
          <h5 className="text-[10px] font-mono text-muted-foreground mb-1">SCENARIOS</h5>
          <div className="space-y-1.5">
            {data.scenarios.map((s, i) => (
              <div key={i} className="bg-secondary/30 border border-border rounded-lg px-3 py-2">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[10px] font-mono text-foreground">{s.label}</span>
                  <span className={cn(
                    "text-[10px] font-mono font-bold",
                    s.edgeShift > 0 ? "text-accent" : "text-destructive"
                  )}>
                    {s.edgeShift > 0 ? "+" : ""}{s.edgeShift}% edge
                  </span>
                </div>
                <Badge variant="outline" className="text-[8px]">{s.altFormation}</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      {!isElite && data.scenarios.length > 0 && (
        <div className="text-[10px] text-muted-foreground italic flex items-center gap-1">
          🔒 "If X is out…" scenarios available with Elite
        </div>
      )}
    </div>
  );
};

export default LineupVolatility;
