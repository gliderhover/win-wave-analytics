import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MatchCardProps {
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  probA: number;
  probDraw: number;
  probB: number;
  signal: "bullish" | "bearish" | "neutral";
  smartMoney: string;
  kickoff: string;
}

const MatchCard = ({ teamA, teamB, flagA, flagB, probA, probDraw, probB, signal, smartMoney, kickoff }: MatchCardProps) => {
  const SignalIcon = signal === "bullish" ? TrendingUp : signal === "bearish" ? TrendingDown : Minus;
  
  return (
    <div className="gradient-card rounded-lg border border-border p-4 card-glow transition-all hover:border-primary/30">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-muted-foreground font-mono">{kickoff}</span>
        <div className={cn(
          "flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded",
          signal === "bullish" && "text-signal-bullish bg-signal-bullish/10",
          signal === "bearish" && "text-signal-bearish bg-signal-bearish/10",
          signal === "neutral" && "text-signal-neutral bg-signal-neutral/10",
        )}>
          <SignalIcon className="w-3 h-3" />
          {smartMoney}
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{flagA}</span>
          <span className="text-sm font-semibold text-foreground">{teamA}</span>
        </div>
        <span className="text-xs text-muted-foreground">vs</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{teamB}</span>
          <span className="text-lg">{flagB}</span>
        </div>
      </div>

      <div className="flex gap-1 h-2 rounded-full overflow-hidden mb-2">
        <div className="bg-primary rounded-l-full transition-all" style={{ width: `${probA}%` }} />
        <div className="bg-muted-foreground/40" style={{ width: `${probDraw}%` }} />
        <div className="bg-signal-bearish rounded-r-full transition-all" style={{ width: `${probB}%` }} />
      </div>
      
      <div className="flex justify-between text-xs font-mono text-muted-foreground">
        <span className="text-primary">{probA}%</span>
        <span>Draw {probDraw}%</span>
        <span className="text-signal-bearish">{probB}%</span>
      </div>
    </div>
  );
};

export default MatchCard;
