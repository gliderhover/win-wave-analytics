import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import MatchQuickActions from "@/components/MatchQuickActions";
import ProGate from "@/components/ProGate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useUserTier } from "@/contexts/UserTierContext";
import { useI18n } from "@/i18n/I18nContext";
import { useLeague } from "@/contexts/LeagueContext";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, Shield, Eye, Bell, Filter, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { fetchFixtures, UiFixture } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const typeIcons: Record<string, React.ReactNode> = {
  "high-edge": <Zap className="w-5 h-5 text-primary" />,
  momentum: <TrendingUp className="w-5 h-5 text-accent" />,
  safe: <Shield className="w-5 h-5 text-muted-foreground" />,
};

const confColors: Record<string, string> = {
  High: "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30",
  Medium: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30",
};

const riskColors: Record<string, string> = {
  Low: "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30",
  Medium: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30",
  High: "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30",
};

type SuggestionRow = {
  id: string;
  fixtureId: string;
  homeTeam: string;
  awayTeam: string;
  leagueName: string;
  kickoffLabel: string;
  isLive: boolean;
  liveScore?: string;
  liveMinute?: string;
  outcomeLabel: string;
  edge: number;
  confidenceBucket: "High" | "Medium";
  riskBucket: "Low" | "Medium" | "High";
  modelProb: number;
  movement: number | null;
  kickoffMs: number;
};

const Suggestions = () => {
  const { isPro } = useUserTier();
  const { t } = useI18n();
  const { selectedLeague } = useLeague();
  const [edgeThreshold, setEdgeThreshold] = useState(4);
  const [confFilter, setConfFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("edge");

  const { apiLeagueId } = useMemo(() => {
    if (selectedLeague === "all") {
      return { apiLeagueId: null as string | null };
    }
    if (selectedLeague.startsWith("sm:")) {
      const idStr = selectedLeague.slice(3);
      return { apiLeagueId: idStr };
    }
    return { apiLeagueId: null as string | null };
  }, [selectedLeague]);

  // A) Real fixtures
  const { data: fixturesData } = useQuery({
    queryKey: ["suggestions-fixtures", apiLeagueId, "14d"],
    queryFn: async () => {
      const days = 14;
      if (!apiLeagueId) {
        return fetchFixtures({ all: true, days });
      }
      return fetchFixtures({ leagueIds: apiLeagueId, days });
    },
    staleTime: 60 * 1000,
    retry: 1,
  });

  const fixtures: UiFixture[] = useMemo(() => {
    const list = fixturesData?.fixtures ?? [];
    // Limit to avoid rate limits
    return list.slice(0, 15);
  }, [fixturesData?.fixtures]);

  // B) Live state
  const { data: liveData } = useQuery({
    queryKey: ["suggestions-live", apiLeagueId],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (apiLeagueId) search.set("leagueIds", apiLeagueId);
      search.set("type", "live");
      const res = await fetch(`/api/sports?${search.toString()}`);
      const json = await res.json();
      if (!json.ok) throw new Error("Failed to load live fixtures");
      return (json.fixtures ?? []) as {
        id: number | string;
        scores?: { home: number | null; away: number | null; description?: string | null } | null;
        state_id: number | null;
        starting_at?: string;
      }[];
    },
    enabled: !!fixtures.length,
    staleTime: 10 * 1000,
    retry: 1,
  });

  const liveByFixtureId = useMemo(() => {
    const map = new Map<
      string,
      { score: string; minute?: string | null; state_id: number | null }
    >();
    if (!liveData) return map;
    for (const f of liveData) {
      const id = String(f.id);
      const h = f.scores?.home;
      const a = f.scores?.away;
      const desc = f.scores?.description ?? "";
      const score =
        h != null && a != null ? `${h}-${a}` : "Live";
      const minuteMatch = desc.match(/(\d{1,3})['’]/);
      const minute = minuteMatch ? `${minuteMatch[1]}'` : desc || null;
      map.set(id, { score, minute, state_id: f.state_id ?? null });
    }
    return map;
  }, [liveData]);

  // C) Model-based probabilities + edge + movement
  const [suggestions, setSuggestions] = useState<SuggestionRow[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!fixtures.length) {
        setSuggestions([]);
        return;
      }
      setLoadingSuggestions(true);
      try {
        const rows = await Promise.all(
          fixtures.map(async (f) => {
            const fixtureId = String(f.id);
            try {
              const probRes = await fetch(
                `/api/sports?type=model_probability&fixtureId=${encodeURIComponent(
                  fixtureId
                )}`
              );
              const probJson = await probRes.json();
              if (!probRes.ok || !probJson.ok) return null;

              const home = Number(probJson.home ?? 0);
              const draw = Number(probJson.draw ?? 0);
              const away = Number(probJson.away ?? 0);
              const confidence = Number(probJson.confidence ?? 60);
              const volatility = Number(probJson.volatility ?? 8);

              const baseHome = 33;
              const baseDraw = 34;
              const baseAway = 33;

              const maxProb = Math.max(home, draw, away);
              const outcome: "home" | "draw" | "away" =
                maxProb === home ? "home" : maxProb === draw ? "draw" : "away";

              const edge =
                outcome === "home"
                  ? home - baseHome
                  : outcome === "draw"
                  ? draw - baseDraw
                  : away - baseAway;

              const confidenceBucket: "High" | "Medium" =
                confidence >= 75 ? "High" : "Medium";
              const riskBucket: "Low" | "Medium" | "High" =
                volatility >= 8 ? "High" : volatility >= 5 ? "Medium" : "Low";

              // Movement via snapshots
              let movement: number | null = null;
              try {
                const moveRes = await fetch(
                  `/api/sports?type=model_probability_movement&fixtureId=${encodeURIComponent(
                    fixtureId
                  )}&minutes=60`
                );
                const moveJson = await moveRes.json();
                if (moveRes.ok && moveJson.ok && Array.isArray(moveJson.snapshots)) {
                  const snaps = moveJson.snapshots;
                  if (snaps.length >= 2) {
                    const first = snaps[0];
                    const last = snaps[snaps.length - 1];
                    const firstVal =
                      outcome === "home"
                        ? Number(first.home)
                        : outcome === "draw"
                        ? Number(first.draw)
                        : Number(first.away);
                    const lastVal =
                      outcome === "home"
                        ? Number(last.home)
                        : outcome === "draw"
                        ? Number(last.draw)
                        : Number(last.away);
                    movement = lastVal - firstVal;
                  }
                }
              } catch {
                movement = null;
              }

              const live = liveByFixtureId.get(fixtureId);

              const kickoffIso = f.kickoffIso || "";
              const kickoffMs = kickoffIso
                ? Date.parse(kickoffIso)
                : Date.now();
              const kickoffLabel = kickoffIso
                ? `${f.kickoffDate} • ${f.kickoffTime} ET`
                : "—";

              const outcomeLabel =
                outcome === "home"
                  ? `${f.homeTeam || "Home"} Win`
                  : outcome === "draw"
                  ? "Draw"
                  : `${f.awayTeam || "Away"} Win`;

              const row: SuggestionRow = {
                id: `${fixtureId}-${outcome}`,
                fixtureId,
                homeTeam: f.homeTeam || "Home",
                awayTeam: f.awayTeam || "Away",
                leagueName: f.leagueName,
                kickoffLabel,
                isLive: !!live,
                liveScore: live?.score,
                liveMinute: live?.minute || undefined,
                outcomeLabel,
                edge,
                confidenceBucket,
                riskBucket,
                modelProb:
                  outcome === "home" ? home : outcome === "draw" ? draw : away,
                movement,
                kickoffMs,
              };
              return row;
            } catch {
              return null;
            }
          })
        );

        if (!cancelled) {
          setSuggestions(rows.filter((r): r is SuggestionRow => !!r));
        }
      } finally {
        if (!cancelled) setLoadingSuggestions(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [fixtures, liveByFixtureId]);

  const filtered = useMemo(() => {
    let list = suggestions.filter(
      (s) => Math.abs(s.edge) >= edgeThreshold
    );
    if (confFilter !== "all") {
      list = list.filter((s) => s.confidenceBucket === confFilter);
    }
    list.sort((a, b) => {
      if (sortBy === "edge") {
        return Math.abs(b.edge) - Math.abs(a.edge);
      }
      if (sortBy === "movement") {
        return Math.abs(b.movement ?? 0) - Math.abs(a.movement ?? 0);
      }
      if (sortBy === "soonest") {
        return a.kickoffMs - b.kickoffMs;
      }
      return 0;
    });
    return list;
  }, [suggestions, edgeThreshold, confFilter, sortBy]);

  const content = (
    <div className="pt-8 pb-20 px-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("suggestions.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("suggestions.subtitle")}</p>

        <div className="gradient-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Filter className="w-3.5 h-3.5" /> {t("common.filters")}
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="text-[10px] underline text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <HelpCircle className="w-3 h-3" />
                  What do these mean?
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Understanding these terms</DialogTitle>
                  <DialogDescription asChild>
                    <div className="space-y-2 text-xs mt-2">
                      <p>
                        <span className="font-semibold">Edge:</span> How much our
                        model leans vs a neutral baseline. Higher edge = stronger
                        lean.
                      </p>
                      <p>
                        <span className="font-semibold">Movement:</span> How much
                        the model probability changed recently. Big movement =
                        something changed.
                      </p>
                      <p>
                        <span className="font-semibold">Min Edge:</span> Hide weak
                        picks by requiring a minimum edge.
                      </p>
                      <p>
                        <span className="font-semibold">Confidence:</span> How sure
                        the model is given data quality and match stability.
                      </p>
                      <p>
                        <span className="font-semibold">Risk:</span> How volatile
                        the pick is; higher risk swings more.
                      </p>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-xs text-muted-foreground block">
                  {t("suggestions.minEdge", { value: String(edgeThreshold) })}
                </label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground">
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[11px] max-w-xs">
                    Minimum edge vs a neutral baseline. Higher = only stronger
                    leans show up.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Slider value={[edgeThreshold]} onValueChange={([v]) => setEdgeThreshold(v)} min={4} max={12} step={0.5} />
            </div>
            <div>
              <div className="flex items-center gap-1 mb-1">
                <label className="text-xs text-muted-foreground block">{t("common.confidence")}</label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button type="button" className="text-muted-foreground">
                      <HelpCircle className="w-3 h-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[11px] max-w-xs">
                    Model certainty based on data quality and match stability.
                  </TooltipContent>
                </Tooltip>
              </div>
              <Select value={confFilter} onValueChange={setConfFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")}</SelectItem>
                  <SelectItem value="High">{t("common.high")}</SelectItem>
                  <SelectItem value="Medium">{t("common.medium")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("common.sortBy")}</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="edge">{t("suggestions.highestEdge")}</SelectItem>
                  <SelectItem value="soonest">{t("suggestions.soonestMatch")}</SelectItem>
                  <SelectItem value="movement">{t("suggestions.mostMovement")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {loadingSuggestions ? (
          <div className="gradient-card rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-1">Loading suggestions…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="gradient-card rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t("suggestions.noSuggestions")}</p>
            <p className="text-xs text-muted-foreground">{t("suggestions.lowerThreshold")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => (
              <div key={s.id} className="gradient-card rounded-xl border border-border p-5 group relative">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
                  <span>{s.homeTeam}</span> {s.homeTeam} {t("common.vs")} {s.awayTeam}
                  <span className="ml-auto">
                    {s.isLive ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-signal-bullish/10 text-signal-bullish border border-signal-bullish/30">
                        LIVE
                        {s.liveScore && <span className="font-mono">{s.liveScore}</span>}
                        {s.liveMinute && <span className="font-mono">{s.liveMinute}</span>}
                      </span>
                    ) : (
                      s.kickoffLabel
                    )}
                  </span>
                  <MatchQuickActions matchId={s.fixtureId} teamA={s.homeTeam} teamB={s.awayTeam} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{typeIcons["high-edge"]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{s.outcomeLabel}</div>
                    <div className="text-xs text-muted-foreground">
                      Model leans {s.edge >= 0 ? "toward" : "against"} this outcome by{" "}
                      <span className="font-mono">
                        {s.edge >= 0 ? "+" : ""}
                        {s.edge.toFixed(1)}%
                      </span>{" "}
                      vs a neutral baseline.
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <Badge variant="outline" className={cn("text-[10px] font-mono", s.edge >= 5 ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" : "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30")}>
                      {t("common.edge")} +{s.edge.toFixed(1)}%
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", confColors[s.confidenceBucket])}>
                      {t(`common.${s.confidenceBucket.toLowerCase()}` as any)}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", riskColors[s.riskBucket])}>
                      {t("common.risk")}: {t(`common.${s.riskBucket.toLowerCase()}` as any)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success(t("suggestions.watchlistAdded", { name: s.outcomeLabel }))}>
                    <Eye className="w-3 h-3 mr-1" /> {t("suggestions.watch")}
                  </Button>
                  {isPro && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success(t("suggestions.alertSet", { name: s.outcomeLabel }))}>
                      <Bell className="w-3 h-3 mr-1" /> {t("suggestions.alert")}
                    </Button>
                  )}
                </div>
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="why" className="border-0">
                    <AccordionTrigger className="text-xs text-muted-foreground py-1 hover:no-underline">{t("suggestions.whyThis")}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground pb-1">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>
                          {t("suggestions.modelProb")}:{" "}
                          <span className="font-mono text-foreground">
                            {s.modelProb.toFixed(1)}%
                          </span>
                        </li>
                        <li>
                          Edge vs baseline:{" "}
                          <span className="font-mono text-foreground">
                            {s.edge >= 0 ? "+" : ""}
                            {s.edge.toFixed(1)}%
                          </span>
                        </li>
                        <li>
                          {t("suggestions.recentMovement")}:{" "}
                          <span className="text-foreground">
                            {s.movement != null
                              ? `${s.movement >= 0 ? "+" : ""}${s.movement.toFixed(
                                  1
                                )} pts over last 60 minutes`
                              : "—"}
                          </span>
                        </li>
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24">
        <ProGate label={t("proGate.unlockSuggestions")}>{content}</ProGate>
      </div>
    </div>
  );
};

export default Suggestions;
