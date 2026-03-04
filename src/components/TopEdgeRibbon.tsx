import { useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { getAllMatches, getTopEdges } from "@/lib/multiLeagueData";
import { useLeague } from "@/contexts/LeagueContext";
import { filterByLeague } from "@/lib/multiLeagueData";
import { useI18n } from "@/i18n/I18nContext";

const TopEdgeRibbon = () => {
  const { selectedLeague } = useLeague();
  const { t } = useI18n();

  const topEdge = useMemo(() => {
    const matches = filterByLeague(getAllMatches(), selectedLeague);
    const top = getTopEdges(matches, 1);
    return top[0] ?? null;
  }, [selectedLeague]);

  if (!topEdge) return null;

  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 fixed top-16 left-0 right-0 z-40">
      <div className="container mx-auto flex items-center justify-center gap-3 text-xs font-mono flex-wrap">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-primary font-semibold">{t("topEdge.label")}:</span>
        <span className="text-muted-foreground">{topEdge.league}</span>
        <span className="text-foreground">{topEdge.teamHome} {t("common.vs")} {topEdge.teamAway}</span>
        <span className="text-signal-bullish font-bold">+{topEdge.edge.toFixed(1)}% {t("common.edge")}</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">{t("topEdge.model")}: {topEdge.modelProbs.home.toFixed(1)}% | {t("topEdge.market")}: {topEdge.marketImplied.home.toFixed(1)}%</span>
      </div>
    </div>
  );
};

export default TopEdgeRibbon;
