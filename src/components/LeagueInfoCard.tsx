import { useQuery } from "@tanstack/react-query";
import { getLeagueInfo, League } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface LeagueInfoCardProps {
  leagueId: number | "ALL";
  fixtureCount?: number;
}

const LeagueInfoCard = ({ leagueId, fixtureCount }: LeagueInfoCardProps) => {
  if (leagueId === "ALL") {
    return (
      <div className="gradient-card rounded-xl border border-border p-5 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">All Leagues</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            Aggregated view across all available competitions.
          </p>
        </div>
        {typeof fixtureCount === "number" && (
          <div className="text-right text-xs text-muted-foreground font-mono">
            Upcoming matches: <span className="text-foreground font-semibold">{fixtureCount}</span>
          </div>
        )}
      </div>
    );
  }

  const {
    data: league,
    isLoading,
    isError,
  } = useQuery<League>({
    queryKey: ["league-info-dynamic", leagueId],
    queryFn: () => getLeagueInfo(String(leagueId)),
    retry: 1,
  });

  if (isLoading) {
    return (
      <div className="gradient-card rounded-xl border border-border p-5 mb-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (isError || !league) {
    return (
      <div className="gradient-card rounded-xl border border-border p-5 mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-foreground">League {leagueId}</h3>
          <p className="text-xs text-muted-foreground font-mono mt-1">
            League info unavailable.
          </p>
        </div>
      </div>
    );
  }

  let lastPlayedLabel = "N/A";
  if (league.last_played_at) {
    const dt = new Date(league.last_played_at);
    if (!Number.isNaN(dt.getTime())) {
      lastPlayedLabel = dt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
  }

  return (
    <div className="gradient-card rounded-xl border border-border p-5 mb-4 flex items-center gap-4">
      {league.image_path ? (
        <img
          src={league.image_path}
          alt={league.name}
          className="h-10 w-10 rounded-lg object-contain bg-secondary"
        />
      ) : (
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center text-lg">
          ⚽
        </div>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-foreground truncate">{league.name}</h3>
          {league.active !== undefined && (
            <Badge
              variant="outline"
              className="text-[10px] px-2 py-0.5"
            >
              {league.active ? "Active" : "Inactive"}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-1">
          {league.short_code && <span>{league.short_code}</span>}
          <span>Last played: {lastPlayedLabel}</span>
        </div>
      </div>

      {typeof fixtureCount === "number" && (
        <div className="text-right text-xs text-muted-foreground font-mono">
          Upcoming matches: <span className="text-foreground font-semibold">{fixtureCount}</span>
        </div>
      )}
    </div>
  );
};

export default LeagueInfoCard;

