import { useQuery } from "@tanstack/react-query";
import { DEFAULT_LEAGUE_ID } from "@/contexts/LeagueContext";
import { getLeagueInfo, getFixtures, League } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const MlsOverviewCard = () => {
  const leagueId = DEFAULT_LEAGUE_ID;

  const {
    data: league,
    isLoading: leagueLoading,
    isError: leagueError,
  } = useQuery<League>({
    queryKey: ["league-info", leagueId],
    queryFn: () => getLeagueInfo(leagueId),
    retry: 1,
  });

  const {
    data: fixtures,
    isLoading: fixturesLoading,
    isError: fixturesError,
  } = useQuery({
    queryKey: ["league-fixtures", leagueId, 30],
    queryFn: () => getFixtures({ leagueId, days: 30 }),
    retry: 1,
  });

  const loading = leagueLoading || fixturesLoading;
  const error = leagueError || fixturesError;
  const upcomingCount = fixtures?.length ?? 0;

  let lastPlayedLabel = "N/A";
  if (league?.last_played_at) {
    const dt = new Date(league.last_played_at);
    if (!Number.isNaN(dt.getTime())) {
      lastPlayedLabel = dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  if (loading) {
    return (
      <div className="gradient-card rounded-xl border border-border p-6 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="gradient-card rounded-xl border border-border p-6 mb-6">
        <h3 className="text-lg font-bold text-foreground mb-2">Major League Soccer</h3>
        <p className="text-sm text-muted-foreground">
          Could not load league overview. Please refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="gradient-card rounded-xl border border-border p-6 mb-6 flex flex-col gap-4">
      <div className="flex items-center gap-4">
        {league.image_path ? (
          <img
            src={league.image_path}
            alt={league.name}
            className="h-12 w-12 rounded-full object-contain bg-secondary"
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-xl">
            ⚽
          </div>
        )}
        <div>
          <h3 className="text-lg font-bold text-foreground">Major League Soccer</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
            <span>USA MLS</span>
            {league.short_code && <span>• {league.short_code}</span>}
          </div>
        </div>
        {league.active && (
          <Badge variant="outline" className="ml-auto text-[10px]">
            Active
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground font-mono">
        <span>Last played: {lastPlayedLabel}</span>
        <span>•</span>
        <span>Upcoming matches (next 30 days): {upcomingCount}</span>
      </div>
    </div>
  );
};

export default MlsOverviewCard;

