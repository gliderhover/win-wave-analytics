import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useMemo, useEffect, useRef } from "react";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import Navbar from "@/components/Navbar";
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import MatchLabTactics from "@/components/matchlab/MatchLabTactics";
import MatchLabCornersCards from "@/components/matchlab/MatchLabCornersCards";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const MatchLab = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isPro, isElite, hasAccess } = useUserTier();

  const match = useMemo(() => mockMatches.find(m => m.id === id) ?? mockMatches[0], [id]);

  // Smooth scroll to anchor on load
  const scrolledRef = useRef(false);
  useEffect(() => {
    if (scrolledRef.current) return;
    const hash = location.hash?.replace("#", "");
    if (hash) {
      setTimeout(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        scrolledRef.current = true;
      }, 300);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TopEdgeRibbon />

      <div className="pt-8 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                Match Lab
                <Badge variant="outline" className="text-[10px] font-mono">PRO+</Badge>
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                {match.flagA} {match.teamA} vs {match.teamB} {match.flagB} • {match.kickoff}
              </p>
            </div>
            <div className={cn(
              "text-xs font-mono font-semibold px-3 py-1 rounded",
              match.signal === "bullish" ? "text-accent bg-accent/10" : match.signal === "bearish" ? "text-destructive bg-destructive/10" : "text-warning bg-warning/10"
            )}>
              {match.signal.toUpperCase()} • Edge {match.edgeA > 0 ? `+${match.edgeA}%` : `${match.edgeB}%`}
            </div>
          </div>

          {/* Section 1: Tactics & Shape */}
          <div id="tactics">
            <MatchLabTactics match={match} />
          </div>

          {/* Section 2: Corners & Cards */}
          <div id="corners-cards" className="mt-6">
            <MatchLabCornersCards match={match} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchLab;
