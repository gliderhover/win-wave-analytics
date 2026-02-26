import { useState, useEffect, useCallback } from "react";
import { scheduleMatches, ScheduleMatch } from "@/lib/scheduleData";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCw, Lock, Bell, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LiveGamesPanelProps {
  onSelectMatch: (matchId: string) => void;
}

const WinProbBar = ({ home, draw, away }: { home: number; draw: number; away: number }) => (
  <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-secondary">
    <div className="bg-primary" style={{ width: `${home}%` }} />
    <div className="bg-muted-foreground/40" style={{ width: `${draw}%` }} />
    <div className="bg-signal-bearish" style={{ width: `${away}%` }} />
  </div>
);

const confColors: Record<string, string> = {
  High: "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30",
  Medium: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30",
  Low: "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30",
};

const LiveGamesPanel = ({ onSelectMatch }: LiveGamesPanelProps) => {
  const { isPro } = useUserTier();
  const navigate = useNavigate();

  const [liveMatches, setLiveMatches] = useState<ScheduleMatch[]>(() =>
    scheduleMatches.filter(m => m.status === "LIVE")
  );
  const [isUpdating, setIsUpdating] = useState(false);

  const simulateRefresh = useCallback(() => {
    setIsUpdating(true);
    setTimeout(() => {
      setLiveMatches(prev =>
        prev.map(m => ({
          ...m,
          minute: Math.min(90, m.minute + 1),
          modelProbs: {
            home: +(m.modelProbs.home + (Math.random() - 0.5) * 1.2).toFixed(1),
            draw: +(m.modelProbs.draw + (Math.random() - 0.5) * 0.8).toFixed(1),
            away: +(m.modelProbs.away + (Math.random() - 0.5) * 1.0).toFixed(1),
          },
          edge: +(m.edge + (Math.random() - 0.5) * 0.6).toFixed(1) as unknown as number,
        }))
      );
      setIsUpdating(false);
    }, 600);
  }, []);

  useEffect(() => {
    const interval = setInterval(simulateRefresh, 8000 + Math.random() * 4000);
    return () => clearInterval(interval);
  }, [simulateRefresh]);

  const handleOpen = (m: ScheduleMatch) => {
    if (m.linkedMatchId) {
      const match = mockMatches.find(mm => mm.id === m.linkedMatchId);
      if (match) {
        onSelectMatch(match.id);
        document.getElementById("match-detail")?.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    toast.info(`${m.teamHome} vs ${m.teamAway} selected`);
  };

  const visibleLimit = isPro ? liveMatches.length : 1;

  return (
    <div className="gradient-card rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-foreground">Live Games</h3>
        <div className="flex items-center gap-2">
          {isUpdating && (
            <span className="text-[10px] text-primary font-mono animate-pulse">Updating…</span>
          )}
          <span className="text-[10px] font-semibold text-signal-bearish bg-signal-bearish/15 border border-signal-bearish/30 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Live Now
          </span>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={simulateRefresh}>
            <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", isUpdating && "animate-spin")} />
          </Button>
        </div>
      </div>

      {liveMatches.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-1">No live matches right now</p>
          <Button variant="link" size="sm" className="text-xs text-primary">
            View upcoming schedule →
          </Button>
        </div>
      ) : (
        <div className="space-y-2 flex-1">
          {liveMatches.map((m, i) => {
            const isLocked = i >= visibleLimit;
            return (
              <div
                key={m.id}
                className={cn(
                  "relative rounded-lg border border-border bg-secondary/30 p-3 transition-all",
                  isLocked && "blur-[6px] pointer-events-none select-none"
                )}
              >
                <div className="flex items-center gap-3">
                  {/* Teams */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                      <span>{m.flagHome}</span>
                      <span className="truncate">{m.teamHome}</span>
                      <span className="text-muted-foreground text-xs">vs</span>
                      <span className="truncate">{m.teamAway}</span>
                      <span>{m.flagAway}</span>
                    </div>
                    {/* Win prob bar */}
                    <div className="mt-1.5">
                      <WinProbBar home={m.modelProbs.home} draw={m.modelProbs.draw} away={m.modelProbs.away} />
                      <div className="flex justify-between text-[9px] text-muted-foreground font-mono mt-0.5">
                        <span>{m.modelProbs.home.toFixed(0)}%</span>
                        <span>{m.modelProbs.draw.toFixed(0)}%</span>
                        <span>{m.modelProbs.away.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Score + minute */}
                  <div className="text-center shrink-0">
                    <div className="font-mono text-lg font-bold text-foreground">{m.scoreHome}–{m.scoreAway}</div>
                    <Badge variant="outline" className="text-[9px] bg-signal-bearish/10 text-signal-bearish border-signal-bearish/30 font-mono">
                      {m.minute}'
                    </Badge>
                  </div>

                  {/* Badges + CTAs */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex gap-1">
                      {m.edge >= 4 && (
                        <Badge variant="outline" className="text-[9px] font-mono bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30">
                          +{m.edge.toFixed(1)}%
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[9px]", confColors[m.confidence])}>
                        {m.confidence}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => handleOpen(m)}>
                        <ExternalLink className="w-3 h-3 mr-0.5" /> Open
                      </Button>
                      {isPro && (
                        <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => toast.success(`Alert set for ${m.teamHome} vs ${m.teamAway}`)}>
                          <Bell className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Locked overlay for FREE users */}
          {!isPro && liveMatches.length > 1 && (
            <div className="relative -mt-[calc((100%-0.5rem)*0.8)] z-10 flex items-center justify-center">
              <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-xl p-4 text-center max-w-xs card-glow">
                <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground mb-1">Unlock full Live Tracker</p>
                <p className="text-[10px] text-muted-foreground mb-3">See all live matches with real-time updates</p>
                <button
                  onClick={() => navigate("/pricing")}
                  className="gradient-primary text-primary-foreground font-semibold text-xs px-5 py-1.5 rounded-lg hover:opacity-90 transition-opacity w-full"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LiveGamesPanel;
