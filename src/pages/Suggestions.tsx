import { useState, useMemo } from "react";
import { mockMatches } from "@/lib/mockData";
import { generateSuggestions, Suggestion } from "@/lib/suggestions";
import Navbar from "@/components/Navbar";
import ProGate from "@/components/ProGate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useUserTier } from "@/contexts/UserTierContext";
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
        <h1 className="text-2xl font-bold text-foreground mb-2">Suggested Bets</h1>
        <p className="text-sm text-muted-foreground mb-6">Actionable picks across all matches based on edge + movement</p>

        <div className="gradient-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <Filter className="w-3.5 h-3.5" /> Filters
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Min Edge: {edgeThreshold}%</label>
              <Slider value={[edgeThreshold]} onValueChange={([v]) => setEdgeThreshold(v)} min={4} max={12} step={0.5} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Confidence</label>
              <Select value={confFilter} onValueChange={setConfFilter}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Sort by</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="edge">Highest Edge</SelectItem>
                  <SelectItem value="soonest">Soonest Match</SelectItem>
                  <SelectItem value="movement">Most Movement</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="gradient-card rounded-xl border border-border p-10 text-center">
            <p className="text-sm text-muted-foreground mb-1">No suggestions match your filters.</p>
            <p className="text-xs text-muted-foreground">Try lowering the edge threshold.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(({ match, suggestion: s }) => (
              <div key={s.id} className="gradient-card rounded-xl border border-border p-5">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 font-mono">
                  <span>{match.flagA}</span> {match.teamA} vs {match.teamB} <span>{match.flagB}</span>
                  <span className="ml-auto">{match.kickoff}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="shrink-0">{typeIcons[s.type]}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.rationale}</div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                    <Badge variant="outline" className={cn("text-[10px] font-mono", s.edge >= 5 ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" : "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30")}>
                      Edge +{s.edge.toFixed(1)}%
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", confColors[s.confidence])}>
                      {s.confidence}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", riskColors[s.risk])}>
                      Risk: {s.risk}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success(`${s.name} added to watchlist`)}>
                    <Eye className="w-3 h-3 mr-1" /> Watch
                  </Button>
                  {isPro && (
                    <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => toast.success(`Alert set for ${s.name}`)}>
                      <Bell className="w-3 h-3 mr-1" /> Alert
                    </Button>
                  )}
                </div>
                <Accordion type="single" collapsible className="mt-2">
                  <AccordionItem value="why" className="border-0">
                    <AccordionTrigger className="text-xs text-muted-foreground py-1 hover:no-underline">Why this?</AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground pb-1">
                      <ul className="list-disc pl-4 space-y-1">
                        <li>Model probability: <span className="font-mono text-foreground">{s.modelProb.toFixed(1)}%</span></li>
                        <li>Market implied probability: <span className="font-mono text-foreground">{s.marketProb.toFixed(1)}%</span></li>
                        <li>Recent movement: <span className="text-foreground">{s.recentMovement}</span></li>
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
      <div className="pt-16">
        <ProGate label="Unlock Suggested Bets">{content}</ProGate>
      </div>
    </div>
  );
};

export default Suggestions;
