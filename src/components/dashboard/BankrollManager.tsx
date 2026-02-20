import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { DollarSign } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type RiskLevel = "conservative" | "moderate" | "aggressive";

const riskMultiplier: Record<RiskLevel, number> = {
  conservative: 0.25,
  moderate: 0.5,
  aggressive: 1.0,
};

const BankrollManager = () => {
  const { isPro } = useUserTier();
  const [bankroll, setBankroll] = useState(1000);
  const [risk, setRisk] = useState<RiskLevel>("moderate");

  const edge = 5.2;
  const odds = 2.08;
  const kellyFraction = (edge / 100) / (odds - 1);
  const adjustedKelly = kellyFraction * riskMultiplier[risk];
  const suggestedStake = Math.round(bankroll * adjustedKelly * 100) / 100;

  const exposure = [
    { market: "1X2", pct: 35 },
    { market: "Over/Under", pct: 25 },
    { market: "BTTS", pct: 20 },
    { market: "Asian HC", pct: 15 },
    { market: "Corners", pct: 5 },
  ];

  const content = (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <div className="flex items-center gap-2 mb-4">
        <DollarSign className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Bankroll Manager</h3>
      </div>

      <div className="space-y-4">
        {/* Bankroll Input */}
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Total Bankroll ($)</label>
          <input
            type="number"
            value={bankroll}
            onChange={(e) => setBankroll(Number(e.target.value))}
            className="w-full bg-secondary border border-border rounded-lg px-3 py-2 font-mono text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Risk Toggle */}
        <div>
          <label className="text-xs text-muted-foreground mb-2 block">Risk Level</label>
          <div className="flex gap-1">
            {(["conservative", "moderate", "aggressive"] as RiskLevel[]).map(level => (
              <button
                key={level}
                onClick={() => setRisk(level)}
                className={cn(
                  "flex-1 text-xs font-semibold py-2 rounded-lg capitalize transition-colors",
                  risk === level
                    ? level === "conservative" ? "bg-signal-bullish/20 text-signal-bullish"
                      : level === "moderate" ? "bg-signal-neutral/20 text-signal-neutral"
                      : "bg-signal-bearish/20 text-signal-bearish"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Stake */}
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-center cursor-help">
              <div className="text-xs text-muted-foreground mb-1">Kelly Suggested Stake</div>
              <div className="font-mono text-2xl font-bold text-primary">${suggestedStake.toFixed(2)}</div>
              <div className="text-xs text-muted-foreground mt-1">{(adjustedKelly * 100).toFixed(1)}% of bankroll</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>Based on Kelly Criterion: (Edge / (Odds - 1)) × Risk Multiplier</TooltipContent>
        </Tooltip>

        {/* Portfolio Exposure */}
        <div>
          <div className="text-xs text-muted-foreground mb-2">Portfolio Exposure</div>
          <div className="space-y-2">
            {exposure.map(e => (
              <div key={e.market} className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-20">{e.market}</span>
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary/60 rounded-full" style={{ width: `${e.pct}%` }} />
                </div>
                <span className="text-xs font-mono text-foreground w-8 text-right">{e.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (!isPro) {
    return <ProGate label="Unlock Bankroll Tools">{content}</ProGate>;
  }

  return content;
};

export default BankrollManager;
