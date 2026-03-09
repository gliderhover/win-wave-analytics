import { useMemo, useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useI18n } from "@/i18n/I18nContext";
import { useQuery } from "@tanstack/react-query";
import ProGate from "@/components/ProGate";
import MatchQuickActions from "@/components/MatchQuickActions";
import UpcomingFixtures from "@/components/UpcomingFixtures";
import LeagueInfoCard from "@/components/LeagueInfoCard";
import { getFixtures, fetchFixtures, Fixture } from "@/lib/api";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { useAiInsight } from "@/hooks/useAiInsight";

type CardMatch = Fixture & {
  teamA: string;
  teamB: string;
  kickoffLabel: string;
  signal: "bullish" | "bearish" | "neutral";
  flagA: string;
  flagB: string;
  modelProbA: number;
  modelProbDraw: number;
  modelProbB: number;
};

const N_MOVEMENT_EAGER = 5;
const N_AI_EAGER = 3;

const MatchesAiInsightCard = ({
  fixtureId,
  teamA,
  teamB,
  eager,
}: {
  fixtureId: string;
  teamA: string;
  teamB: string;
  eager: boolean;
}) => {
  const { data, loading, error, fetchNow } = useAiInsight(fixtureId, eager);

  const hasData = !!data?.aiInsight;
  const shouldShowButton = !eager && !hasData && !loading;

  return (
    <div className="gradient-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🤖</span>
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          AI Insight
        </h3>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="h-3 bg-secondary/60 rounded animate-pulse" />
          <div className="h-3 bg-secondary/60 rounded animate-pulse w-5/6" />
          <div className="h-3 bg-secondary/60 rounded animate-pulse w-3/4" />
        </div>
      ) : hasData ? (
        <>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {data.aiInsight}
          </p>
          {data.keyFactors?.length > 0 && (
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              {data.keyFactors.map((f, idx) => (
                <li key={idx}>{f}</li>
              ))}
            </ul>
          )}
        </>
      ) : shouldShowButton ? (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Generate a tailored insight for {teamA} vs {teamB}.
          </p>
          <button
            type="button"
            onClick={fetchNow}
            className="text-[11px] font-mono px-3 py-1.5 rounded-md border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            Generate insight
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Insight unavailable.
          {error ? ` (${error})` : ""}
        </p>
      )}
    </div>
  );
};

const MatchWinRateMovement = ({
  fixtureId,
  teamA,
  teamB,
  eager,
}: {
  fixtureId: string;
  teamA: string;
  teamB: string;
  eager: boolean;
}) => {
  const [hasIntersected, setHasIntersected] = useState(eager);
  const [loading, setLoading] = useState(false);
  const [series, setSeries] = useState<{ ts: number; home: number; draw: number; away: number }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (eager) return;
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasIntersected(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [eager]);

  useEffect(() => {
    if (!fixtureId || !(eager || hasIntersected)) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // First try movement
        const moveRes = await fetch(
          `/api/sports?type=model_probability_movement&fixtureId=${encodeURIComponent(fixtureId)}&minutes=60`
        );
        const moveJson = await moveRes.json();
        let snaps: any[] = [];
        if (moveRes.ok && moveJson.ok && Array.isArray(moveJson.snapshots)) {
          snaps = moveJson.snapshots;
        }

        if (!snaps.length) {
          // Fallback to single-point probability
          const probRes = await fetch(
            `/api/sports?type=model_probability&fixtureId=${encodeURIComponent(fixtureId)}`
          );
          const probJson = await probRes.json();
          if (probRes.ok && probJson.ok) {
            snaps = [
              {
                ts: Date.now(),
                home: probJson.home,
                draw: probJson.draw,
                away: probJson.away,
              },
            ];
          }
        }

        if (!cancelled) {
          setSeries(
            snaps
              .map((s) => ({
                ts: Number(s.ts),
                home: Number(s.home),
                draw: Number(s.draw),
                away: Number(s.away),
              }))
              .filter((s) => Number.isFinite(s.ts))
              .sort((a, b) => a.ts - b.ts)
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load win-rate movement");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [fixtureId, eager, hasIntersected]);

  const chartData = series.map((s) => ({
    time: new Date(s.ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
    home: s.home,
    draw: s.draw,
    away: s.away,
  }));

  const hasSeries = chartData.length >= 2;

  return (
    <div ref={ref} className="gradient-card rounded-xl border border-border p-5 card-glow">
      <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider mb-3">
        Win-Rate Movement
      </h3>
      <div className="h-32">
        {loading && !hasSeries ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            Collecting win-rate data…
          </div>
        ) : hasSeries ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis
                dataKey="time"
                tick={{ fontSize: 9, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 9, fill: "hsl(215 20% 55%)" }}
                axisLine={false}
                tickLine={false}
                width={26}
              />
              <RTooltip
                contentStyle={{
                  background: "hsl(222 47% 9%)",
                  border: "1px solid hsl(222 30% 16%)",
                  borderRadius: 8,
                  fontSize: 11,
                }}
                labelStyle={{ color: "hsl(210 40% 93%)" }}
              />
              <Line type="monotone" dataKey="home" stroke="hsl(175 85% 50%)" strokeWidth={1.5} dot={false} name={teamA} />
              <Line type="monotone" dataKey="draw" stroke="hsl(45 93% 55%)" strokeWidth={1.5} dot={false} name="Draw" />
              <Line type="monotone" dataKey="away" stroke="hsl(0 72% 55%)" strokeWidth={1.5} dot={false} name={teamB} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            {error ? "Collecting win-rate data…" : "Collecting win-rate data…"}
          </div>
        )}
      </div>
    </div>
  );
};

const Matches = () => {
  const { isPro } = useUserTier();
  const { t } = useI18n();
  const { selectedLeague } = useLeague();
  const [range, setRange] = useState<"today" | "7" | "30" | "90">("90");

  const daysForRange = range === "today" ? 1 : range === "7" ? 7 : range === "30" ? 30 : 90;

  const { apiLeagueId, infoLeagueId } = useMemo(() => {
    if (selectedLeague === "all") {
      return { apiLeagueId: null, infoLeagueId: "ALL" as const };
    }
    if (selectedLeague.startsWith("sm:")) {
      const idStr = selectedLeague.slice(3);
      const n = Number.parseInt(idStr, 10);
      return {
        apiLeagueId: idStr,
        infoLeagueId: Number.isNaN(n) ? ("ALL" as const) : n,
      };
    }
    // Static fallback leagues don't have a Sportmonks ID; treat as ALL for info.
    return { apiLeagueId: null, infoLeagueId: "ALL" as const };
  }, [selectedLeague]);

  const { data: leagueFixtures } = useQuery<Fixture[]>({
    queryKey: ["matches-league-fixtures", apiLeagueId, daysForRange],
    queryFn: () => getFixtures({ leagueId: apiLeagueId!, days: daysForRange }),
    enabled: !!apiLeagueId,
    retry: 1,
  });

  const { data: allFixturesData } = useQuery({
    queryKey: ["fixtures", { league: "all", days: daysForRange }],
    queryFn: () => fetchFixtures({ all: true, days: daysForRange }),
    enabled: selectedLeague === "all",
    retry: 1,
  });

  const fixtureCount =
    selectedLeague === "all"
      ? (allFixturesData?.fixtures?.length ?? 0)
      : (leagueFixtures?.length ?? 0);

  const cardMatches: CardMatch[] = useMemo(() => {
    const templates = mockMatches;
    const baseList: { id: string; home: string; away: string; kickoffLabel: string }[] = [];

    if (selectedLeague === "all") {
      const list = allFixturesData?.fixtures ?? [];
      for (const f of list) {
        baseList.push({
          id: String(f.id),
          home: f.homeTeam || "Home",
          away: f.awayTeam || "Away",
          kickoffLabel: `${f.kickoffDate} • ${f.kickoffTime} ET`,
        });
      }
    } else if (leagueFixtures) {
      for (const f of leagueFixtures) {
        baseList.push({
          id: String(f.id),
          home: f.home?.name ?? "Home",
          away: f.away?.name ?? "Away",
          kickoffLabel: f.starting_at || "—",
        });
      }
    }

    const count = Math.min(baseList.length, templates.length);
    const out: CardMatch[] = [];
    for (let i = 0; i < count; i++) {
      const base = baseList[i];
      const tmpl = templates[i % templates.length];
      out.push({
        // Fixture fields
        id: base.id,
        starting_at: "",
        state_id: null,
        league: { id: "", name: "" },
        home: { id: null, name: base.home },
        away: { id: null, name: base.away },
        // View fields mapped from mock template
        teamA: base.home,
        teamB: base.away,
        kickoffLabel: base.kickoffLabel,
        signal: tmpl.signal,
        flagA: tmpl.flagA,
        flagB: tmpl.flagB,
        modelProbA: tmpl.modelProbA,
        modelProbDraw: tmpl.modelProbDraw,
        modelProbB: tmpl.modelProbB,
      });
    }

    return out;
  }, [allFixturesData?.fixtures, leagueFixtures, selectedLeague]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {selectedLeague !== "all" && <TopEdgeRibbon />}

      <div className="pt-[7.5rem] pb-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">{t("matches.title")}</h1>

          <div className="mb-8">
            <LeagueInfoCard leagueId={infoLeagueId} fixtureCount={fixtureCount} />
            <div className="flex items-center gap-2 mb-3 text-[10px]">
              <span className="text-muted-foreground font-mono uppercase tracking-wide">
                Range
              </span>
              {[
                { key: "today", label: "Today" },
                { key: "7", label: "Next 7 days" },
                { key: "30", label: "Next 30 days" },
                { key: "90", label: "Next 90 days" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRange(opt.key as "today" | "7" | "30" | "90")}
                  className={cn(
                    "px-3 py-1 rounded-full border text-[10px] font-semibold transition-all",
                    range === opt.key
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <UpcomingFixtures days={daysForRange} maxItems={12} />
          </div>

          <div className="space-y-6">
            {cardMatches.map((match, i) => {
              const SignalIcon = match.signal === "bullish" ? TrendingUp : match.signal === "bearish" ? TrendingDown : Minus;
              const isLocked = !isPro && i > 0;

              const card = (
                <div key={match.id} className="gradient-card rounded-xl border border-border p-6 group relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{match.flagA}</span>
                      <span className="text-lg font-bold text-foreground">{match.teamA}</span>
                      <span className="text-muted-foreground text-sm">{t("common.vs")}</span>
                      <span className="text-lg font-bold text-foreground">{match.teamB}</span>
                      <span className="text-2xl">{match.flagB}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-muted-foreground">{match.kickoffLabel}</span>
                      <div className={cn(
                        "flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded",
                        match.signal === "bullish" && "text-signal-bullish bg-signal-bullish/10",
                        match.signal === "bearish" && "text-signal-bearish bg-signal-bearish/10",
                        match.signal === "neutral" && "text-signal-neutral bg-signal-neutral/10",
                      )}>
                        <SignalIcon className="w-3 h-3" />
                        {match.signal.toUpperCase()}
                      </div>
                      <MatchQuickActions matchId={match.id} teamA={match.teamA} teamB={match.teamB} />
                    </div>
                  </div>

                  <div className="flex gap-1 h-3 rounded-full overflow-hidden mb-3">
                    <div className="bg-primary rounded-l-full" style={{ width: `${match.modelProbA}%` }} />
                    <div className="bg-muted-foreground/40" style={{ width: `${match.modelProbDraw}%` }} />
                    <div className="bg-signal-bearish rounded-r-full" style={{ width: `${match.modelProbB}%` }} />
                  </div>
                  <div className="flex justify-between text-xs font-mono text-muted-foreground mb-4">
                    <span className="text-primary">{match.teamA} {match.modelProbA}%</span>
                    <span>{t("common.draw")} {match.modelProbDraw}%</span>
                    <span className="text-signal-bearish">{match.teamB} {match.modelProbB}%</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MatchWinRateMovement
                      fixtureId={match.id}
                      teamA={match.teamA}
                      teamB={match.teamB}
                      eager={i < N_MOVEMENT_EAGER}
                    />
                    <MatchesAiInsightCard
                      fixtureId={match.id}
                      teamA={match.teamA}
                      teamB={match.teamB}
                      eager={i < N_AI_EAGER}
                    />
                  </div>
                </div>
              );

              if (isLocked) {
                return (
                  <ProGate key={match.id} label={t("proGate.unlock")}>
                    {card}
                  </ProGate>
                );
              }

              return <div key={match.id}>{card}</div>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Matches;
