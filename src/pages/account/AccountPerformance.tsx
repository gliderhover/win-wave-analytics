import { performanceData } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, LineChart, Line } from "recharts";
import { TrendingUp, Target, Award, Flame, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const AccountPerformance = () => {
  const d = performanceData;
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("all");
  const [league, setLeague] = useState("all");

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={timeframe} onValueChange={setTimeframe}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
            <SelectItem value="90d">Last 90 Days</SelectItem>
            <SelectItem value="1y">Last Year</SelectItem>
          </SelectContent>
        </Select>
        <Select value={league} onValueChange={setLeague}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Leagues</SelectItem>
            <SelectItem value="epl">Premier League</SelectItem>
            <SelectItem value="laliga">La Liga</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={() => toast({ title: "Export started", description: "CSV download will begin shortly." })}>
          <Download className="w-3 h-3 mr-1" /> Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Target, label: "Win Rate", value: `${d.winRate}%`, color: "text-primary" },
          { icon: TrendingUp, label: "Avg ROI", value: `+${d.avgROI}%`, color: "text-signal-bullish" },
          { icon: Award, label: "Total Profit", value: `$${d.totalProfit.toLocaleString()}`, color: "text-primary" },
          { icon: Flame, label: "Current Streak", value: `${d.streaks.current}W`, color: "text-signal-neutral" },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-5">
            <s.icon className={`w-5 h-5 ${s.color} mb-2`} />
            <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
            <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-4">Monthly Profit</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="profit" fill="hsl(175 85% 50%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-4">Win Rate Trend</h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={d.monthlyData}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 80]} tick={{ fontSize: 11, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="winRate" stroke="hsl(145 70% 50%)" strokeWidth={2} dot={{ fill: "hsl(145 70% 50%)", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Strongest Market</div>
          <div className="font-mono text-lg font-bold text-signal-bullish">{d.bestMarket}</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="text-xs text-muted-foreground mb-1">Weakest Market</div>
          <div className="font-mono text-lg font-bold text-signal-bearish">{d.worstMarket}</div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Total Bets</div>
            <div className="font-mono text-xl font-bold text-foreground">{d.totalBets}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Best Streak</div>
            <div className="font-mono text-xl font-bold text-signal-bullish">{d.streaks.best}W</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Current Streak</div>
            <div className="font-mono text-xl font-bold text-signal-neutral">{d.streaks.current}W</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPerformance;
