import { useState, useCallback } from "react";
import { MatchData } from "@/lib/mockData";
import { generateSuggestions, Suggestion } from "@/lib/suggestions";
import ProGate from "@/components/ProGate";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";
import { Zap, TrendingUp, Shield, RefreshCw, Bell, Eye, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const typeIcons: Record<Suggestion["type"], React.ReactNode> = {
  "high-edge": <Zap className="w-5 h-5 text-primary" />,
  momentum: <TrendingUp className="w-5 h-5 text-accent" />,
  safe: <Shield className="w-5 h-5 text-muted-foreground" />,
};

const confColors: Record<string, string> = {
  High: "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30",
  Medium: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30",
  Low: "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30",
};

const riskColors: Record<string, string> = {
  Low: "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30",
  Medium: "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30",
  High: "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30",
};

interface SuggestedBetsProps {
  match: MatchData;
}

const SuggestedBets = ({ match }: SuggestedBetsProps) => {
  const { isPro } = useUserTier();
  const navigate = useNavigate();
  const [suggestions, setSuggestions] = useState(() => generateSuggestions(match));
  const [lastUpdated, setLastUpdated] = useState(() => new Date().toLocaleTimeString());

  const refresh = useCallback(() => {
    setSuggestions(generateSuggestions(match));
    setLastUpdated(new Date().toLocaleTimeString());
    toast.success("Suggestions refreshed");
  }, [match]);

  // Refresh when match changes
  const [prevMatchId, setPrevMatchId] = useState(match.id);
  if (match.id !== prevMatchId) {
    setPrevMatchId(match.id);
    setSuggestions(generateSuggestions(match));
    setLastUpdated(new Date().toLocaleTimeString());
  }

  const content = (
    <div className="gradient-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-lg font-bold text-foreground">Suggested Bets</h3>
        <Button variant="ghost" size="sm" onClick={refresh} className="gap-1.5 text-xs text-muted-foreground">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mb-5">Actionable picks based on edge + movement</p>

      {suggestions.length === 0 ? (
        <div className="text-center py-8">
          <AlertTriangle className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-1">No strong edges right now.</p>
          <p className="text-xs text-muted-foreground mb-4">Try another match or set a threshold alert.</p>
          {isPro ? (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info("Alert threshold set!")}>
              <Bell className="w-3.5 h-3.5" /> Set Threshold Alert
            </Button>
          ) : (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate("/pricing")}>
              <Bell className="w-3.5 h-3.5" /> Set Threshold Alert (PRO)
            </Button>
          )}
        </div>
      ) : (
        <Accordion type="multiple" className="space-y-3">
          {suggestions.map((s, i) => (
            <AccordionItem key={s.id} value={s.id} className="border border-border rounded-lg bg-secondary/30 px-4">
              <div className="flex items-center gap-3 py-3">
                <div className="shrink-0">{typeIcons[s.type]}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm text-foreground">{s.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{s.rationale}</div>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
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
                <div className="flex items-center gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={() => toast.success(`${s.name} added to watchlist`)}>
                    <Eye className="w-3 h-3 mr-1" /> Watch
                  </Button>
                  {isPro && (
                    <Button variant="outline" size="sm" className="text-xs h-7 px-2.5" onClick={() => toast.success(`Alert set for ${s.name}`)}>
                      <Bell className="w-3 h-3 mr-1" /> Alert
                    </Button>
                  )}
                </div>
              </div>
              {/* Mobile badges */}
              <div className="flex sm:hidden items-center gap-1.5 pb-2">
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
              <AccordionTrigger className="text-xs text-muted-foreground py-2 hover:no-underline">Why this?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground pb-3">
                <ul className="list-disc pl-4 space-y-1">
                  <li>Model probability: <span className="font-mono text-foreground">{s.modelProb.toFixed(1)}%</span></li>
                  <li>Market implied probability: <span className="font-mono text-foreground">{s.marketProb.toFixed(1)}%</span></li>
                  <li>Recent movement: <span className="text-foreground">{s.recentMovement}</span></li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <span className="text-[10px] text-muted-foreground font-mono">Last updated: {lastUpdated} • Method: Edge Engine v1</span>
      </div>
    </div>
  );

  return <ProGate label="Unlock Suggested Bets" >{content}</ProGate>;
};

export default SuggestedBets;
