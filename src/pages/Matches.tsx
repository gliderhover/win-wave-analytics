import { useState } from "react";
import Navbar from "@/components/Navbar";
import TopEdgeRibbon from "@/components/TopEdgeRibbon";
import { mockMatches } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { useI18n } from "@/i18n/I18nContext";
import ProGate from "@/components/ProGate";
import OddsMovementChart from "@/components/dashboard/OddsMovementChart";
import AIInsight from "@/components/dashboard/AIInsight";
import MatchQuickActions from "@/components/MatchQuickActions";
import UpcomingFixtures from "@/components/UpcomingFixtures";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const Matches = () => {
  const { isPro } = useUserTier();
  const { t } = useI18n();
  const [range, setRange] = useState<"today" | "7" | "30">("30");

  const daysForRange = range === "today" ? 1 : range === "7" ? 7 : 30;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <TopEdgeRibbon />

      <div className="pt-[7.5rem] pb-20 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-6">{t("matches.title")}</h1>

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3 text-[10px]">
              <span className="text-muted-foreground font-mono uppercase tracking-wide">
                Range
              </span>
              {[
                { key: "today", label: "Today" },
                { key: "7", label: "Next 7 days" },
                { key: "30", label: "Next 30 days" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setRange(opt.key as "today" | "7" | "30")}
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
            {mockMatches.map((match, i) => {
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
                      <span className="text-xs font-mono text-muted-foreground">{match.kickoff}</span>
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
                    <OddsMovementChart match={match} full={isPro && !isLocked} />
                    <AIInsight match={match} />
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
