import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUserTier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Lock, Eye, Bell, Calendar, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchFixtures, UiFixture } from "@/lib/api";
import { formatNYTimeWithET } from "@/lib/time";

interface GameSchedulePanelProps {
  onSelectMatch: (matchId: string) => void;
}

const dayOptions = ["Today", "Tomorrow", "This Week"] as const;
const sortOptions = ["Soonest", "Highest Edge", "Most Movement"] as const;

const GameSchedulePanel = ({ onSelectMatch }: GameSchedulePanelProps) => {
  const { isPro } = useUserTier();
  const { selectedLeague } = useLeague();
  const navigate = useNavigate();
  const [day, setDay] = useState<string>("Today");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("Soonest");

  const daysForRange =
    day === "Today" ? 1 :
    day === "Tomorrow" ? 2 :
    7;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-schedule-fixtures", selectedLeague, daysForRange],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      searchParams.set("days", String(daysForRange));
      if (selectedLeague === "all") {
        searchParams.set("all", "true");
      } else if (selectedLeague.startsWith("sm:")) {
        searchParams.set("leagueIds", selectedLeague.slice(3));
      } else {
        searchParams.set("all", "true");
      }
      return fetchFixtures({ leagueIds: searchParams.get("leagueIds") ?? undefined, all: searchParams.get("all") === "true", days: daysForRange });
    },
    retry: 1,
  });

  const upcoming = useMemo(() => {
    let list: UiFixture[] = data?.fixtures ?? [];

    if (day === "Today" || day === "Tomorrow") {
      const now = new Date();
      const target = new Date(now);
      if (day === "Tomorrow") {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      const targetStr = target.toISOString().slice(0, 10);
      list = list.filter((f) => (f.kickoffIso ?? "").slice(0, 10) === targetStr);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.homeTeam.toLowerCase().includes(q) ||
          m.awayTeam.toLowerCase().includes(q)
      );
    }

    // Sort by soonest
    list = [...list].sort((a, b) =>
      (a.kickoffIso || "").localeCompare(b.kickoffIso || "")
    );

    return list;
  }, [data?.fixtures, day, search, sortBy]);

  // Group by kickoff time label
  const grouped = useMemo(() => {
    const map = new Map<string, UiFixture[]>();
    for (const m of upcoming) {
      const key = m.kickoffTime || m.kickoffDate || "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(m);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [upcoming]);

  const visibleLimit = isPro ? Infinity : 3;
  let runningCount = 0;

  const handleSelect = (m: UiFixture) => {
    onSelectMatch(m.id);
    navigate(`/match/${m.id}`);
  };

  return (
    <div className="gradient-card rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          <h3 className="text-base font-bold text-foreground">Game Schedule</h3>
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-7 w-[130px] text-[10px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {sortOptions.map(s => (
              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search team…" className="pl-8 h-7 text-xs bg-secondary border-border" />
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

      {isError ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-1">Could not load schedule.</p>
          <p className="text-xs text-muted-foreground">Please try again in a moment.</p>
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 flex-1 flex flex-col items-center justify-center">
          <p className="text-sm text-muted-foreground mb-1">Loading schedule…</p>
        </div>
      ) : grouped.length === 0 ? (
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
                  {formatNYTimeWithET(matches[0].kickoffIso)}
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
                              <span className="truncate">{m.homeTeam}</span>
                              <span className="text-muted-foreground text-xs">vs</span>
                              <span className="truncate">{m.awayTeam}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground font-mono">
                              <Badge variant="outline" className="text-[8px] h-4 px-1">{m.leagueName}</Badge>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <div className="flex gap-1">
                              <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => {
                                handleSelect(m as any);
                              }}>
                                <Eye className="w-3 h-3 mr-0.5" /> Open
                              </Button>
                              {isPro && (
                              <Button variant="outline" size="sm" className="text-[10px] h-6 px-2" onClick={() => toast.success(`Notification set for ${m.homeTeam} vs ${m.awayTeam}`)}>
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
