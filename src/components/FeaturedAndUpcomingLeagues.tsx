import { Link } from "react-router-dom";
import { UiFixture } from "@/lib/api";
import { toMatchContextFromUiFixture } from "@/types/match";
import MatchQuickActions from "@/components/MatchQuickActions";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export const MATCHES_PER_LEAGUE = 3;

export type FeaturedNowItem = { id: number; name: string; fixtures: UiFixture[] };
export type UpcomingSoonItem = { id: number; name: string };

interface FeaturedAndUpcomingLeaguesProps {
  featuredNow: FeaturedNowItem[];
  upcomingSoon: UpcomingSoonItem[];
  isLoading?: boolean;
}

export default function FeaturedAndUpcomingLeagues({
  featuredNow,
  upcomingSoon,
  isLoading = false,
}: FeaturedAndUpcomingLeaguesProps) {
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
