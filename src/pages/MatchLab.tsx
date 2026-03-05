import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockMatches } from "@/lib/mockData";
import type { MatchData } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { useI18n } from "@/i18n/I18nContext";
import Navbar from "@/components/Navbar";
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import MatchLabTactics from "@/components/matchlab/MatchLabTactics";
import MatchLabCornersCards from "@/components/matchlab/MatchLabCornersCards";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { getFixture } from "@/lib/api";
import { toMatchContext } from "@/types/match";

const MatchLab = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro, isElite, hasAccess } = useUserTier();
  const { t } = useI18n();
  const scrolledRef = useRef(false);

  const {
    data: fixtureData,
    isLoading: fixtureLoading,
    isError: fixtureError,
  } = useQuery({
    queryKey: ["fixture", id],
    queryFn: () => getFixture(id!),
    enabled: !!id,
    retry: 1,
  });

  const matchContext = fixtureData ? toMatchContext(fixtureData) : null;

  useEffect(() => {
    if (scrolledRef.current) return;
    const hash = location.hash?.replace("#", "");
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        scrolledRef.current = true;
      }, 300);
    }
  }, [location.hash, matchContext]);

  if (fixtureLoading && !matchContext) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <TopEdgeRibbon />
        <div className="pt-[7.5rem] pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <p className="text-sm text-muted-foreground">Loading match…</p>
          </div>
        </div>
      </div>
    );
  }

  if (fixtureError || !matchContext) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <TopEdgeRibbon />
        <div className="pt-[7.5rem] pb-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <p className="text-sm text-muted-foreground">Match details unavailable.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const legacyMatch: MatchData = {
    ...mockMatches[0],
    id: String(matchContext.id),
    teamA: matchContext.home.name,
    teamB: matchContext.away.name,
    kickoff: matchContext.kickoff,
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TopEdgeRibbon />

      <div className="pt-[7.5rem] pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                {t("matchlab.title")}
                <Badge variant="outline" className="text-[10px] font-mono">{t("matchlab.pro")}</Badge>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                {matchContext.home.name} vs {matchContext.away.name} • {matchContext.leagueName} • {matchContext.kickoff}
              </p>
            </div>
          </div>

          <div id="tactics">
            <MatchLabTactics match={legacyMatch} />
          </div>

          <div id="corners-cards" className="mt-6">
            <MatchLabCornersCards match={legacyMatch} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLab;
