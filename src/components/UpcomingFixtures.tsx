import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLeague } from "@/contexts/LeagueContext";
import { fetchFixtures, UiFixture } from "@/lib/api";
import { toMatchContextFromUiFixture } from "@/types/match";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import MatchQuickActions from "@/components/MatchQuickActions";
import { cn } from "@/lib/utils";

interface UpcomingFixturesProps {
  days?: number;
  maxItems?: number;
  className?: string;
}

function buildParamsFromLeague(selectedLeague: string, days: number) {
  if (selectedLeague === "all") {
    return { all: true as const, days };
  }
  if (selectedLeague.startsWith("sm:")) {
    const id = selectedLeague.slice(3);
    return { leagueIds: id, days };
  }

  const staticMap: Record<string, string> = {
    wc: "732",
    ucl: "2",
    epl: "8",
    laliga: "564",
    seriea: "384",
  };
  const mapped = staticMap[selectedLeague];
  if (mapped) {
    return { leagueIds: mapped, days };
  }

  return { all: true as const, days };
}

const UpcomingFixtures = ({ days = 30, maxItems = 10, className }: UpcomingFixturesProps) => {
  const { selectedLeague } = useLeague();

  const queryKey = useMemo(
    () => ["fixtures", { league: selectedLeague, days }],
    [selectedLeague, days]
  );

  const { data, isLoading, isError } = useQuery({
    queryKey,
    queryFn: async () => {
      const params = buildParamsFromLeague(selectedLeague, days);
      return fetchFixtures(params);
    },
    retry: 1,
  });

  const fixtures = data?.fixtures ?? [];
  const limited = fixtures.slice(0, maxItems);

  return (
    <div className={cn("gradient-card rounded-xl border border-border p-6 card-glow", className)}>
      <h3 className="text-base font-bold text-foreground mb-4">Upcoming matches</h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
            >
              <div className="flex-1 min-w-0 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground">
          Could not load matches. Please refresh.
        </p>
      ) : limited.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No upcoming matches found for the selected league.
        </p>
      ) : (
        <div className="space-y-2">
          {limited.map((m: UiFixture) => {
            const match = toMatchContextFromUiFixture(m);
            return (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                    <span className="truncate">{m.homeTeam || "TBD"}</span>
                    <span className="text-muted-foreground text-xs">vs</span>
                    <span className="truncate">{m.awayTeam || "TBD"}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                    {m.kickoffDate && <span>{m.kickoffDate}</span>}
                    {m.kickoffTime && (
                      <>
                        <span>•</span>
                        <span>{m.kickoffTime}</span>
                      </>
                    )}
                    {m.leagueName && (
                      <>
                        <span>•</span>
                        <Badge variant="outline" className="text-[9px]">
                          {m.leagueName}
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <MatchQuickActions match={match} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UpcomingFixtures;

