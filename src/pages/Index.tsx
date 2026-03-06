import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Brain, BarChart3, Zap, Shield, LineChart, Trophy, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import { useLeague } from "@/contexts/LeagueContext";
import { useI18n } from "@/i18n/I18nContext";
import MatchQuickActions from "@/components/MatchQuickActions";
import { cn } from "@/lib/utils";
import FeaturedAndUpcomingLeagues from "@/components/FeaturedAndUpcomingLeagues";
import { fetchFixtures, UiFixture } from "@/lib/api";
import {
  HOMEPAGE_FEATURED_8_IDS,
  HOMEPAGE_FEATURED_8_IDS_STR,
  CHIP_LEAGUES,
  UPCOMING_SOON_LEAGUES,
  getLeagueNameById,
} from "@/constants/leagueGroups";
import { toMatchContextFromUiFixture } from "@/types/match";
import { MATCHES_PER_LEAGUE } from "@/components/FeaturedAndUpcomingLeagues";
import type { FeaturedNowItem, UpcomingSoonItem } from "@/components/FeaturedAndUpcomingLeagues";

const TOP_UPCOMING_MAX = 12;

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

const Index = () => {
  const { setSelectedLeague, selectedLeague } = useLeague();
  const { t } = useI18n();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["homepage-featured-fixtures", HOMEPAGE_FEATURED_8_IDS_STR],
    queryFn: () => fetchFixtures({ leagueIds: HOMEPAGE_FEATURED_8_IDS_STR, days: 30 }),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const { featuredNow, upcomingSoon, remainingFixtures } = useMemo(() => {
    const fixtures = isError ? [] : (data?.fixtures ?? []);
    const grouped = groupByLeagueId(fixtures);

    const featuredNow: FeaturedNowItem[] = [];
    const upcomingSoon: UpcomingSoonItem[] = [];
    const shownIds = new Set<string>();

    for (const id of HOMEPAGE_FEATURED_8_IDS) {
      const list = grouped.get(id) ?? [];
      const name = getLeagueNameById(id);
      if (list.length > 0) {
        const slice = list.slice(0, MATCHES_PER_LEAGUE);
        slice.forEach((f) => shownIds.add(f.id));
        featuredNow.push({ id, name, fixtures: slice });
      } else {
        upcomingSoon.push({ id, name });
      }
    }

    for (const l of UPCOMING_SOON_LEAGUES) {
      if (!upcomingSoon.some((u) => u.id === l.id)) {
        upcomingSoon.push({ id: l.id, name: l.name });
      }
    }

    const remaining = fixtures
      .filter((f) => !shownIds.has(f.id))
      .sort((a, b) => (a.kickoffIso || "").localeCompare(b.kickoffIso || ""))
      .slice(0, TOP_UPCOMING_MAX);

    return { featuredNow, upcomingSoon, remainingFixtures: remaining };
  }, [data?.fixtures, isError]);

  const featuredFiltered = useMemo(() => {
    if (selectedLeague === "all") return featuredNow;
    if (!selectedLeague.startsWith("sm:")) return featuredNow;
    const id = parseInt(selectedLeague.slice(3), 10);
    if (Number.isNaN(id)) return featuredNow;
    const found = featuredNow.find((l) => l.id === id);
    if (found) return [found];
    const isChipLeague = CHIP_LEAGUES.some((c) => c.id === id);
    if (isChipLeague) {
      const name = getLeagueNameById(id);
      return [{ id, name, fixtures: [] }];
    }
    return featuredNow;
  }, [featuredNow, selectedLeague]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(175_85%_50%/0.06),transparent_60%)]" />
        <div className="container mx-auto text-center relative">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {t("index.heroSubtitle")}
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 animate-slide-up-delay-1 leading-tight">
            {t("index.heroTitle1")}<br />
            <span className="text-glow text-primary">{t("index.heroTitle2")}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up-delay-2">
            {t("index.heroDescription")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-3">
            <Link
              to="/dashboard"
              onClick={() => setSelectedLeague("wc")}
              className="gradient-primary text-primary-foreground font-bold px-8 py-3.5 rounded-lg text-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              {t("index.viewWorldCup")}
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setSelectedLeague("all")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono border border-border px-6 py-3 rounded-lg hover:border-primary/30"
            >
              {t("index.browseAllLeagues")}
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "73.2%", label: t("index.hitRate") },
              { value: "8", label: t("index.leaguesTracked") },
              { value: "156", label: t("index.matchesAnalyzed") },
              { value: "+18.4%", label: t("index.avgROI") },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* League chips — supported leagues only */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-nowrap justify-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedLeague("all")}
              className={cn(
                "shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all",
                selectedLeague === "all"
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              )}
            >
              All
            </button>
            {CHIP_LEAGUES.map((l) => {
              const value = `sm:${l.id}`;
              const isSelected = selectedLeague === value;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setSelectedLeague(value)}
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all",
                    isSelected
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Games + Upcoming soon */}
      <FeaturedAndUpcomingLeagues
        featuredNow={featuredFiltered}
        upcomingSoon={upcomingSoon}
        isLoading={isLoading}
      />

      {/* Top Upcoming Matches Across Leagues — real fixtures, no duplicates from Featured */}
      <section className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">Top Upcoming Matches Across Leagues</h2>
              <p className="text-xs text-muted-foreground mt-1">Next matches across leagues</p>
            </div>
            <Link
              to="/matches"
              onClick={() => setSelectedLeague("all")}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
            >
              See full schedule <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {remainingFixtures.length === 0 && !isLoading && (
              <p className="text-sm text-muted-foreground py-4">No additional upcoming matches to show.</p>
            )}
            {remainingFixtures.map((m) => {
              const match = toMatchContextFromUiFixture(m);
              return (
                <div key={m.id} className="gradient-card rounded-lg border border-border p-3 flex items-center gap-3 hover:border-primary/30 transition-all">
                  <span className="text-[10px] font-mono shrink-0 min-w-[70px] justify-center rounded border border-border bg-secondary/50 px-2 py-0.5 text-muted-foreground">
                    {m.leagueName || "—"}
                  </span>
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm text-foreground font-semibold">
                    <span className="truncate">{m.homeTeam || "TBD"}</span>
                    <span className="text-muted-foreground text-xs">{t("common.vs")}</span>
                    <span className="truncate">{m.awayTeam || "TBD"}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                    {m.kickoffDate && m.kickoffTime ? `${m.kickoffDate} • ${m.kickoffTime} ET` : "—"}
                  </span>
                  <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                    Upcoming
                  </span>
                  <MatchQuickActions match={match} />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">{t("index.platform")}</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">{t("index.unfairAdvantage")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={Brain} title={t("feature.aiPredictor")} description={t("feature.aiPredictorDesc")} stat="73.2%" statLabel={t("feature.accuracy")} />
            <FeatureCard icon={LineChart} title={t("feature.liveOdds")} description={t("feature.liveOddsDesc")} stat="<2s" statLabel={t("feature.updateLatency")} />
            <FeatureCard icon={Zap} title={t("feature.smartMoney")} description={t("feature.smartMoneyDesc")} stat="156" statLabel={t("feature.signalsPerDay")} />
            <FeatureCard icon={BarChart3} title={t("feature.multiLeague")} description={t("feature.multiLeagueDesc")} stat="8" statLabel={t("feature.leagues")} />
            <FeatureCard icon={Shield} title={t("feature.bankroll")} description={t("feature.bankrollDesc")} />
            <FeatureCard icon={Activity} title={t("feature.analytics")} description={t("feature.analyticsDesc")} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">BetIQ</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-lg">
            {t("index.footer.disclaimer")}
          </p>
          <div className="text-xs text-muted-foreground">© 2026 BetIQ</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
