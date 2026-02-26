import { useState, useMemo } from "react";
import { scheduleMatches, ScheduleMatch } from "@/lib/scheduleData";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Lock, Eye, Bell, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GameSchedulePanelProps {
  onSelectMatch: (matchId: string) => void;
}

const dayOptions = ["Today", "Tomorrow", "This Week"] as const;
const leagueOptions = ["All", "World Cup", "Qualifiers", "Friendlies"] as const;

const GameSchedulePanel = ({ onSelectMatch }: GameSchedulePanelProps) => {
  const { isPro } = useUserTier();
  const navigate = useNavigate();
  const [day, setDay] = useState<string>("Today");
  const [league, setLeague] = useState<string>("All");

  const upcoming = useMemo(() => {
    let list = scheduleMatches.filter(m => m.status === "UPCOMING");
    if (day !== "This Week") list = list.filter(m => m.kickoffDate === day);
    if (league !== "All") list = list.filter(m => m.league === league);
    return list;
  }, [day, league]);

  // Group by kickoff time
  const grouped = useMemo(() => {
    const map = new Map<string, ScheduleMatch[]>();
    for (const m of upcoming) {
      const key = m.kickoffUtc;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcoming]);

  const visibleLimit = isPro ? Infinity : 3;
  let runningCount = 0;

  const handleSelect = (m: ScheduleMatch) => {
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

  return (
    <div className="gradient-card rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Game Schedule</h3>
        </div>
        <Select value={league} onValueChange={setLeague}>
          <SelectTrigger className="h-7 w-[120px] text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {leagueOptions.map(l => (
              <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Day chips */}
      <div className="flex gap-1.5 mb-4">
        {dayOptions.map(d => (
          <button
            key={d}
            onClick={() => setDay(d)}
            className={cn(
              "text-[10px] font-semibold px-3 py-1 rounded-full border transition-all",
              day === d
                ? "border-primary bg-primary/10 text-foreground"
                : "border-border text-muted-foreground hover:border-primary/30"
            )}
          >
            {d}
          </button>
        ))}
      </div>

      {grouped.length === 0 ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-1">No matches scheduled</p>
          <p className="text-xs text-muted-foreground">Try changing the filter above</p>
        </div>
      ) : (
        <div className="space-y-4 flex-1 relative">
          {grouped.map(([time, matches]) => {
            return (
              <div key={time}>
                <div className="text-[10px] font-mono text-muted-foreground mb-1.5">
                  {matches[0].kickoffLocal} <span className="text-muted-foreground/60">({time} UTC)</span>
                </div>
                <div className="space-y-1.5">
                  {matches.map(m => {
                    runningCount++;
                    const isLocked = runningCount > visibleLimit;
                    return (
                      <div
                        key={m.id}
                        className={cn(
                          "rounded-lg border border-border bg-secondary/30 p-3 transition-all",
                          isLocked && "blur-[6px] pointer-events-none select-none"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                              <span>{m.flagHome}</span>
                              <span className="truncate">{m.teamHome}</span>
                              <span className="text-muted-foreground text-xs">vs</span>
                              <span className="truncate">{m.teamAway}</span>
                              <span>{m.flagAway}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-mono">
                              <span>Open: {m.openMarketImplied.home}%</span>
                              <span>→</span>
                              <span>Now: {m.marketImplied.home}%</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {m.edge >= 4 && (
                              <Badge variant="outline" className="text-[9px] font-mono bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30">
                                +{m.edge.toFixed(1)}% Edge
                              </Badge>
                            )}
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => {
                                handleSelect(m);
                                toast.success(`${m.teamHome} vs ${m.teamAway} added to watchlist`);
                              }}>
                                <Eye className="w-3 h-3 mr-0.5" /> Watch
                              </Button>
                              {isPro && (
                                <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => toast.success(`Notification set for ${m.teamHome} vs ${m.teamAway}`)}>
                                  <Bell className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* Locked overlay for FREE */}
          {!isPro && upcoming.length > 3 && (
            <div className="flex items-center justify-center mt-2">
              <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-xl p-4 text-center max-w-xs card-glow">
                <Lock className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-xs font-semibold text-foreground mb-1">Unlock full schedule + alerts</p>
                <p className="text-[10px] text-muted-foreground mb-3">See all upcoming matches with notifications</p>
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

export default GameSchedulePanel;
