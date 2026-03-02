import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { generateLeaderboard, MIN_BETS_TO_RANK, LeaderboardEntry } from "@/lib/simulationData";
import { leagues } from "@/lib/leagueData";
import { cn } from "@/lib/utils";
import { ArrowLeft, Trophy, Info, Medal, Award, Star } from "lucide-react";

const badgeIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  weekly_winner: { icon: <Star className="w-3 h-3 text-signal-neutral" />, label: "Weekly Winner" },
  monthly_champion: { icon: <Medal className="w-3 h-3 text-primary" />, label: "Monthly Champion" },
  certified: { icon: <Award className="w-3 h-3 text-signal-bullish" />, label: "Certified" },
};

const SimulationLeaderboard = () => {
  const [timeframe, setTimeframe] = useState("season");
  const [leagueFilter, setLeagueFilter] = useState("all");

  const leaderboard = useMemo(() => generateLeaderboard(timeframe), [timeframe]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/simulation" className="flex items-center gap-1 text-xs text-primary font-mono mb-4 hover:underline">
            <ArrowLeft className="w-3 h-3" /> Back to Simulation
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Global Leaderboard</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">
            Top 100 paper traders worldwide •
            <Tooltip>
              <TooltipTrigger className="inline-flex items-center gap-1 ml-1 text-primary underline underline-offset-2 cursor-help">
                How ranking works <Info className="w-3 h-3" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs text-xs">
                <p className="font-semibold mb-1">Score = ROI% − (0.25 × MaxDrawdown%)</p>
                <p>This rewards consistent returns while penalizing large drawdowns. Minimum {MIN_BETS_TO_RANK} bets required to rank.</p>
              </TooltipContent>
            </Tooltip>
          </p>

          {/* Controls */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="flex gap-1.5">
              {["weekly", "monthly", "season", "all-time"].map(t => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={cn(
                    "text-[10px] font-semibold px-3 py-1.5 rounded-full border transition-all capitalize",
                    timeframe === t
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {t === "all-time" ? "All Time" : t}
                </button>
              ))}
            </div>
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger className="h-7 w-[130px] text-[10px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Leagues</SelectItem>
                {leagues.map(l => (
                  <SelectItem key={l.id} value={l.id} className="text-xs">{l.logo} {l.shortName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="gradient-card rounded-xl border border-border overflow-hidden">
            <div className="grid grid-cols-[50px_1fr_70px_80px_60px_60px_70px_70px_50px] bg-secondary/50 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              <span>#</span>
              <span>User</span>
              <span className="text-right">Score</span>
              <span className="text-right">ROI</span>
              <span className="text-right">Win%</span>
              <span className="text-right">Bets</span>
              <span className="text-right">Bankroll</span>
              <span className="text-right">MaxDD</span>
              <span></span>
            </div>
            {leaderboard.map((entry, i) => (
              <div
                key={entry.rank}
                className={cn(
                  "grid grid-cols-[50px_1fr_70px_80px_60px_60px_70px_70px_50px] px-4 py-2.5 text-xs items-center",
                  i % 2 === 0 ? "bg-transparent" : "bg-secondary/10",
                  entry.rank <= 3 && "bg-primary/5"
                )}
              >
                <span className={cn("font-mono font-bold",
                  entry.rank === 1 ? "text-signal-neutral" : entry.rank === 2 ? "text-muted-foreground" : entry.rank === 3 ? "text-signal-bearish/70" : "text-muted-foreground"
                )}>
                  {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : entry.rank}
                </span>
                <div className="flex items-center gap-1.5 min-w-0">
                  <span>{entry.flag}</span>
                  <span className="font-semibold text-foreground truncate">{entry.username}</span>
                </div>
                <span className="text-right font-mono font-bold text-primary">{entry.score.toFixed(1)}</span>
                <span className={cn("text-right font-mono", entry.roi >= 0 ? "text-signal-bullish" : "text-signal-bearish")}>
                  {entry.roi >= 0 ? "+" : ""}{entry.roi.toFixed(1)}%
                </span>
                <span className="text-right font-mono text-foreground">{entry.winRate.toFixed(0)}%</span>
                <span className="text-right font-mono text-muted-foreground">{entry.bets}</span>
                <span className="text-right font-mono text-foreground">{(entry.bankroll / 1000).toFixed(1)}k</span>
                <span className="text-right font-mono text-signal-bearish">{entry.maxDrawdown.toFixed(1)}%</span>
                <div className="flex gap-0.5 justify-end">
                  {entry.badges.map(b => (
                    <Tooltip key={b}>
                      <TooltipTrigger>{badgeIcons[b]?.icon}</TooltipTrigger>
                      <TooltipContent className="text-[10px]">{badgeIcons[b]?.label}</TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center text-[10px] text-muted-foreground font-mono">
            Simulation only • No real money • No payouts • Not betting advice. 18+.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationLeaderboard;
