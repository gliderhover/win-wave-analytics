import { useState, useMemo } from "react";
import { mockMatches } from "@/lib/mockData";
import { generateSuggestions, Suggestion } from "@/lib/suggestions";
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
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, Shield, Eye, Bell, Filter } from "lucide-react";
import { toast } from "sonner";

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

const Suggestions = () => {
  const { isPro } = useUserTier();
  const { t } = useI18n();
  const [edgeThreshold, setEdgeThreshold] = useState(4);
  const [confFilter, setConfFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("edge");

  const allSuggestions = useMemo(() => {
    const result: { match: typeof mockMatches[0]; suggestion: Suggestion }[] = [];
    for (const match of mockMatches) {
      for (const s of generateSuggestions(match)) {
        result.push({ match, suggestion: s });
      }
    }
    return result;
  }, []);

  const filtered = useMemo(() => {
    let list = allSuggestions.filter(({ suggestion }) => suggestion.edge >= edgeThreshold);
    if (confFilter !== "all") list = list.filter(({ suggestion }) => suggestion.confidence === confFilter);
    list.sort((a, b) => {
      if (sortBy === "edge") return b.suggestion.edge - a.suggestion.edge;
      if (sortBy === "movement") return Math.abs(b.match.lineVelocity) - Math.abs(a.match.lineVelocity);
      return 0;
    });
    return list;
  }, [allSuggestions, edgeThreshold, confFilter, sortBy]);

  const content = (
    <div className="pt-8 pb-20 px-4">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("suggestions.title")}</h1>
        <p className="text-sm text-muted-foreground mb-6">{t("suggestions.subtitle")}</p>

        <div className="gradient-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Filter className="w-3.5 h-3.5" /> {t("common.filters")}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("suggestions.minEdge", { value: String(edgeThreshold) })}</label>
              <Slider value={[edgeThreshold]} onValueChange={([v]) => setEdgeThreshold(v)} min={4} max={12} step={0.5} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">{t("common.confidence")}</label>
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

        {filtered.length === 0 ? (
          <div className="gradient-card rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-1">{t("suggestions.noSuggestions")}</p>
            <p className="text-xs text-muted-foreground">{t("suggestions.lowerThreshold")}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(({ match, suggestion: s }) => (
              <div key={s.id} className="gradient-card rounded-xl border border-border p-5 group relative">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
                  <span>{match.flagA}</span> {match.teamA} {t("common.vs")} {match.teamB} <span>{match.flagB}</span>
                  <span className="ml-auto">{match.kickoff}</span>
                  <MatchQuickActions matchId={match.id} teamA={match.teamA} teamB={match.teamB} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{typeIcons[s.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.rationale}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <Badge variant="outline" className={cn("text-[10px] font-mono", s.edge >= 5 ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" : "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30")}>
                      {t("common.edge")} +{s.edge.toFixed(1)}%
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", confColors[s.confidence])}>
                      {t(`common.${s.confidence.toLowerCase()}` as any)}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", riskColors[s.risk])}>
                      {t("common.risk")}: {t(`common.${s.risk.toLowerCase()}` as any)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success(t("suggestions.watchlistAdded", { name: s.name }))}>
                    <Eye className="w-3 h-3 mr-1" /> {t("suggestions.watch")}
                  </Button>
                  {isPro && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success(t("suggestions.alertSet", { name: s.name }))}>
                      <Bell className="w-3 h-3 mr-1" /> {t("suggestions.alert")}
                    </Button>
                  )}
                </div>
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="why" className="border-0">
                    <AccordionTrigger className="text-xs text-muted-foreground py-1 hover:no-underline">{t("suggestions.whyThis")}</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground pb-1">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>{t("suggestions.modelProb")}: <span className="font-mono text-foreground">{s.modelProb.toFixed(1)}%</span></li>
                        <li>{t("suggestions.marketProb")}: <span className="font-mono text-foreground">{s.marketProb.toFixed(1)}%</span></li>
                        <li>{t("suggestions.recentMovement")}: <span className="text-foreground">{s.recentMovement}</span></li>
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
