import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";

interface WinRateMovementChartProps {
  fixtureId: string | null;
  teamA: string;
  teamB: string;
  isLive: boolean;
  full?: boolean;
}

const fetchProbability = async (fixtureId: string) => {
  const res = await fetch(`/api/model/probability?fixtureId=${encodeURIComponent(fixtureId)}`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to fetch probability");
  return json;
};

const postSnapshot = async (fixtureId: string, home: number, draw: number, away: number) => {
  await fetch("/api/model/probability/snapshot", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fixtureId, home, draw, away }),
  });
};

const fetchMovement = async (fixtureId: string, minutes: number) => {
  const res = await fetch(
    `/api/model/probability/movement?fixtureId=${encodeURIComponent(fixtureId)}&minutes=${minutes}`
  );
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Failed to fetch movement");
  return json;
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
};

const WinRateMovementChart = ({ fixtureId, teamA, teamB, isLive, full = false }: WinRateMovementChartProps) => {
  const pollInterval = isLive ? 15_000 : 60_000;

  const { data: probData } = useQuery({
    queryKey: ["model-probability", fixtureId],
    queryFn: () => fetchProbability(fixtureId!),
    enabled: !!fixtureId,
    staleTime: pollInterval,
    refetchInterval: pollInterval,
  });

  useEffect(() => {
    if (!fixtureId || !probData?.ok) return;
    postSnapshot(fixtureId, probData.home, probData.draw, probData.away);
  }, [fixtureId, probData?.home, probData?.draw, probData?.away]);

  const { data: movementData } = useQuery({
    queryKey: ["model-movement", fixtureId, isLive],
    queryFn: () => fetchMovement(fixtureId!, isLive ? 90 : 60),
    enabled: !!fixtureId,
    staleTime: pollInterval,
    refetchInterval: pollInterval,
  });

  const snapshots = movementData?.snapshots ?? [];
  const chartData = snapshots.length > 0
    ? snapshots.map((s: { ts: number; home: number; draw: number; away: number }) => ({
        time: formatTime(s.ts),
        home: s.home,
        draw: s.draw,
        away: s.away,
      }))
    : probData?.ok
      ? [{ time: "Now", home: probData.home, draw: probData.draw, away: probData.away }]
      : [];
  const current = probData?.ok
    ? { home: probData.home, draw: probData.draw, away: probData.away }
    : null;

  if (!fixtureId) {
    return (
      <div className="gradient-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">
          Win-Rate Movement
        </h3>
        <div className="text-sm text-muted-foreground">Select a match to view win-rate movement.</div>
      </div>
    );
  }

  if (!full) {
    const prev = snapshots[0];
    const last = snapshots[snapshots.length - 1];
    const homePrev = prev?.home ?? current?.home ?? 33;
    const homeCur = last?.home ?? current?.home ?? 33;
    return (
      <div className="gradient-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">
          Win-Rate Movement
        </h3>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Open</div>
            <div className="font-mono text-lg font-bold text-muted-foreground">{homePrev}%</div>
          </div>
          <div className="flex-1 mx-4 h-px bg-border relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-muted-foreground" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Current</div>
            <div className="font-mono text-lg font-bold text-primary">{homeCur}%</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">
        Win-Rate Movement
      </h3>
      <div className="h-40">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <RTooltip
                contentStyle={{
                  background: "hsl(222 47% 9%)",
                  border: "1px solid hsl(222 30% 16%)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelStyle={{ color: "hsl(210 40% 93%)" }}
              />
              <Line type="monotone" dataKey="home" stroke="hsl(175 85% 50%)" strokeWidth={2} dot={false} name={teamA} />
              <Line type="monotone" dataKey="draw" stroke="hsl(45 93% 55%)" strokeWidth={2} dot={false} name="Draw" />
              <Line type="monotone" dataKey="away" stroke="hsl(0 72% 55%)" strokeWidth={2} dot={false} name={teamB} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
            Collecting win-rate data…
          </div>
        )}
      </div>
    </div>
  );
};

export default WinRateMovementChart;
