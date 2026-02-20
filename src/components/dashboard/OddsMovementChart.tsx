import { MatchData } from "@/lib/mockData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

const OddsMovementChart = ({ match, full = false }: { match: MatchData; full?: boolean }) => {
  const data = match.oddsHistory;

  if (!full) {
    // Free tier: only show open vs current
    const simplified = [data[0], data[data.length - 1]];
    return (
      <div className="gradient-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">Odds Movement</h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Open</div>
            <div className="font-mono text-lg font-bold text-muted-foreground">{simplified[0].probA}%</div>
          </div>
          <div className="flex-1 mx-4 h-px bg-border relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="font-mono text-lg font-bold text-primary">{simplified[1].probA}%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">Odds Movement</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} />
            <YAxis domain={["dataMin - 2", "dataMax + 2"]} tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }} axisLine={false} tickLine={false} width={30} />
            <RTooltip
              contentStyle={{ background: "hsl(222 47% 9%)", border: "1px solid hsl(222 30% 16%)", borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: "hsl(210 40% 93%)" }}
            />
            <Line type="monotone" dataKey="probA" stroke="hsl(175 85% 50%)" strokeWidth={2} dot={false} name={match.teamA} />
            <Line type="monotone" dataKey="probB" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={false} name={match.teamB} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default OddsMovementChart;
