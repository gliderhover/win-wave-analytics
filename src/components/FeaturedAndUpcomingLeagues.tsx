import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { fetchFixtures, UiFixture } from "@/lib/api";
import {
  HOMEPAGE_FEATURED_IDS,
  HOMEPAGE_FEATURED_IDS_STR,
  UPCOMING_SOON_LEAGUES,
  getLeagueNameById,
} from "@/constants/leagueGroups";
import { toMatchContextFromUiFixture } from "@/types/match";
import MatchQuickActions from "@/components/MatchQuickActions";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

const MATCHES_PER_LEAGUE = 3;

function groupByLeagueId(fixtures: UiFixture[]): Map<number, UiFixture[]> {
  const map = new Map<number, UiFixture[]>();
  for (const f of fixtures) {
    const id = f.leagueId ?? 0;
    if (id) {
      const list = map.get(id) ?? [];
      list.push(f);
      map.set(id, list);
    }
  }
  return map;
}

export default function FeaturedAndUpcomingLeagues() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["homepage-featured-fixtures", HOMEPAGE_FEATURED_IDS_STR],
    queryFn: () => fetchFixtures({ leagueIds: HOMEPAGE_FEATURED_IDS_STR, days: 30 }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const { featuredNow, upcomingSoon } = useMemo(() => {
    const fixtures = isError ? [] : (data?.fixtures ?? []);
    const grouped = groupByLeagueId(fixtures);

    const featuredNow: { id: number; name: string; fixtures: UiFixture[] }[] = [];
    const upcomingSoon: { id: number; name: string }[] = [];

    for (const id of HOMEPAGE_FEATURED_IDS) {
      const list = grouped.get(id) ?? [];
      const name = getLeagueNameById(id);
      if (list.length > 0) {
        featuredNow.push({ id, name, fixtures: list.slice(0, MATCHES_PER_LEAGUE) });
      } else {
        upcomingSoon.push({ id, name });
      }
    }

    // Add UCL and Europa to Upcoming Soon (branding; not in homepage fetch; 732 already handled above)
    const upcomingIds = new Set(upcomingSoon.map((l) => l.id));
    for (const l of UPCOMING_SOON_LEAGUES) {
      if (l.id === 732) continue; // World Cup already in featuredNow or upcomingSoon from fetch
      if (!upcomingIds.has(l.id)) {
        upcomingSoon.push({ id: l.id, name: l.name });
      }
    }

    return { featuredNow, upcomingSoon };
  }, [data?.fixtures, isError]);

  if (isLoading) {
    return (
      <section className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl space-y-8">
          <div>
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          </div>
          <div>
            <Skeleton className="h-6 w-40 mb-4" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-16 w-32 rounded-lg" />
              <Skeleton className="h-16 w-32 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 border-t border-border">
      <div className="container mx-auto max-w-4xl space-y-10">
        {/* Block 1: Featured leagues (Now) — only if at least one league has fixtures */}
        {featuredNow.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Featured leagues (Now)</h2>
              <Link
                to="/matches"
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                See full schedule <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-6">
              {featuredNow.map(({ id, name, fixtures }) => (
                <div
                  key={id}
                  className="gradient-card rounded-xl border border-border p-4"
                >
                  <div className="text-sm font-semibold text-foreground mb-3">{name}</div>
                  <ul className="space-y-2">
                    {fixtures.map((m) => {
                      const match = toMatchContextFromUiFixture(m);
                      return (
                        <li
                          key={m.id}
                          className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 px-3 py-2"
                        >
                          <div className="flex-1 min-w-0 text-sm text-foreground">
                            <span className="font-medium">{m.homeTeam || "TBD"}</span>
                            <span className="text-muted-foreground text-xs mx-1.5">vs</span>
                            <span className="font-medium">{m.awayTeam || "TBD"}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                            {m.kickoffDate && m.kickoffTime
                              ? `${m.kickoffDate} • ${m.kickoffTime} ET`
                              : "—"}
                          </span>
                          <MatchQuickActions match={match} />
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block 2: Upcoming soon — leagues with no fixtures + UCL/Europa */}
        {upcomingSoon.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Upcoming soon</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {upcomingSoon.map(({ id, name }) => (
                <div
                  key={id}
                  className="rounded-xl border border-border bg-secondary/20 p-4 flex flex-col gap-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg opacity-80">{id === 732 ? "🏆" : "⚽"}</span>
                    <span className="text-sm font-semibold text-foreground">{name}</span>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border w-fit">
                    Upcoming soon
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Schedule will appear when available.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
