import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { getAllMatches, getTopEdges } from "@/lib/multiLeagueData";
import { useLeague } from "@/contexts/LeagueContext";
import { filterByLeague } from "@/lib/multiLeagueData";

const TopEdgeRibbon = () => {
  const { selectedLeague } = useLeague();

  const topEdge = useMemo(() => {
    const matches = filterByLeague(getAllMatches(), selectedLeague);
    const top = getTopEdges(matches, 1);
    return top[0] ?? null;
  }, [selectedLeague]);

  if (!topEdge) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 sticky top-16 z-40">
      <div className="container mx-auto flex items-center justify-center gap-3 text-xs font-mono flex-wrap">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-primary font-semibold">TOP EDGE:</span>
        <span className="text-muted-foreground">{topEdge.league}</span>
        <span className="text-foreground">{topEdge.teamHome} vs {topEdge.teamAway}</span>
        <span className="text-signal-bullish font-bold">+{topEdge.edge.toFixed(1)}% Edge</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">Model: {topEdge.modelProbs.home.toFixed(1)}% | Market: {topEdge.marketImplied.home.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default TopEdgeRibbon;
