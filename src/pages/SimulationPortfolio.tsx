import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  getSimulationState, saveSimulationState, settleAllOpenBets, getStats,
  generateBankrollHistory, SimulationState, VIRTUAL_CURRENCY, resetSimulation,
} from "@/lib/simulationData";
import { cn } from "@/lib/utils";
import { ArrowLeft, Coins, TrendingUp, Target, BarChart3, AlertTriangle, RotateCcw, CheckCircle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { toast } from "sonner";

const SimulationPortfolio = () => {
  const [simState, setSimState] = useState<SimulationState>(getSimulationState);
  const [leagueFilter, setLeagueFilter] = useState("all");

  const stats = getStats(simState.bets);
  const bankrollHistory = useMemo(() => generateBankrollHistory(simState), [simState.bankroll]);

  const openBets = simState.bets.filter(b => b.status === "open");
  const settledBets = simState.bets.filter(b => b.status !== "open");

  const filteredOpen = leagueFilter === "all" ? openBets : openBets.filter(b => b.league === leagueFilter);
  const filteredSettled = leagueFilter === "all" ? settledBets : settledBets.filter(b => b.league === leagueFilter);

  const handleSettleAll = () => {
    const next = settleAllOpenBets(simState);
    setSimState(next);
    toast.success("All open bets settled!");
  };

  const handleReset = () => {
    const next = resetSimulation();
    setSimState(next);
    toast.success("Simulation reset to default bankroll");
  };

  const uniqueLeagues = [...new Set(simState.bets.map(b => b.league))];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/simulation" className="flex items-center gap-1 text-xs text-primary font-mono mb-4 hover:underline">
            <ArrowLeft className="w-3 h-3" /> Back to Simulation
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
              <p className="text-xs text-muted-foreground">Your virtual betting performance</p>
            </div>
            <div className="flex gap-2">
              {openBets.length > 0 && (
                <Button variant="outline" size="sm" className="text-xs" onClick={handleSettleAll}>
                  <CheckCircle className="w-3 h-3 mr-1" /> Settle All
                </Button>
              )}
              <Button variant="outline" size="sm" className="text-xs text-signal-bearish" onClick={handleReset}>
                <RotateCcw className="w-3 h-3 mr-1" /> Reset
              </Button>
            </div>
          </div>

          {/* Responsible Play Reminder */}
          <div className="bg-signal-neutral/10 border border-signal-neutral/20 rounded-lg p-3 mb-6 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-signal-neutral shrink-0" />
            <span className="text-xs text-signal-neutral">Simulation only. No real-money wagering. For educational/entertainment purposes.</span>
          </div>

          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Coins, label: "Bankroll", value: `${simState.bankroll.toLocaleString()}`, color: "text-foreground" },
              { icon: TrendingUp, label: "ROI", value: `${stats.roi >= 0 ? "+" : ""}${stats.roi}%`, color: stats.roi >= 0 ? "text-signal-bullish" : "text-signal-bearish" },
              { icon: Target, label: "Win Rate", value: `${stats.winRate}%`, color: "text-primary" },
              { icon: BarChart3, label: "Max Drawdown", value: `${stats.maxDrawdownPct}%`, color: "text-signal-bearish" },
            ].map(s => (
              <div key={s.label} className="gradient-card rounded-xl border border-border p-4">
                <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                <div className="text-[10px] text-muted-foreground mb-1">{s.label}</div>
                <div className={`font-mono text-xl font-bold ${s.color}`}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Bankroll chart */}
          <div className="gradient-card rounded-xl border border-border p-5 mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Bankroll Over Time ({VIRTUAL_CURRENCY})</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bankrollHistory}>
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8, fontSize: 12 }} />
                  <Line type="monotone" dataKey="value" stroke="hsl(175 85% 50%)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* League filter */}
          {uniqueLeagues.length > 1 && (
            <div className="mb-4">
              <Select value={leagueFilter} onValueChange={setLeagueFilter}>
                <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  {uniqueLeagues.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Tabs */}
          <Tabs defaultValue="open">
            <TabsList className="mb-4">
              <TabsTrigger value="open">Open Bets ({filteredOpen.length})</TabsTrigger>
              <TabsTrigger value="settled">Settled Bets ({filteredSettled.length})</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="open">
              {filteredOpen.length === 0 ? (
                <div className="gradient-card rounded-xl border border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground mb-1">No open bets</p>
                  <Link to="/simulation" className="text-xs text-primary hover:underline">Place your first paper bet →</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredOpen.map(b => (
                    <div key={b.id} className="gradient-card rounded-lg border border-border p-4 flex items-center gap-3">
                      <Badge variant="outline" className="text-[8px] font-mono shrink-0">{b.league}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{b.flagHome} {b.teamHome} vs {b.teamAway} {b.flagAway}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {b.selectionLabel} @ {b.impliedOdds} • Stake: {b.stake.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xs text-muted-foreground">Potential</div>
                        <div className="font-mono text-sm font-bold text-foreground">{b.potentialPayout.toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="settled">
              {filteredSettled.length === 0 ? (
                <div className="gradient-card rounded-xl border border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">No settled bets yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...filteredSettled].reverse().map(b => (
                    <div key={b.id} className="gradient-card rounded-lg border border-border p-4 flex items-center gap-3">
                      <Badge variant="outline" className="text-[8px] font-mono shrink-0">{b.league}</Badge>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{b.flagHome} {b.teamHome} vs {b.teamAway} {b.flagAway}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                          {b.selectionLabel} @ {b.impliedOdds} • Stake: {b.stake.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[9px] shrink-0",
                        b.status === "won" ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" : "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30"
                      )}>
                        {b.status === "won" ? "WON" : "LOST"}
                      </Badge>
                      <div className={cn("font-mono text-sm font-bold shrink-0", b.pnl >= 0 ? "text-signal-bullish" : "text-signal-bearish")}>
                        {b.pnl >= 0 ? "+" : ""}{b.pnl.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics">
              <div className="gradient-card rounded-xl border border-border p-6">
                <h3 className="text-sm font-semibold text-foreground mb-4">Performance Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Bets", value: stats.totalBets },
                    { label: "Win Rate", value: `${stats.winRate}%` },
                    { label: "Avg Odds", value: stats.avgOdds },
                    { label: "ROI", value: `${stats.roi >= 0 ? "+" : ""}${stats.roi}%` },
                    { label: "Total P&L", value: `${stats.totalPnl >= 0 ? "+" : ""}${stats.totalPnl.toLocaleString()}` },
                    { label: "Max Drawdown", value: `${stats.maxDrawdownPct}%` },
                    { label: "Longest Win Streak", value: stats.longestWinStreak },
                    { label: "Current Streak", value: `${stats.currentStreak}W` },
                  ].map(s => (
                    <div key={s.label} className="bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-[10px] text-muted-foreground mb-1">{s.label}</div>
                      <div className="font-mono text-lg font-bold text-foreground">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-[10px] text-muted-foreground font-mono">
            For educational/entertainment purposes only. Not betting advice. 18+.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationPortfolio;
