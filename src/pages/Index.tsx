import { useMemo, useState } from "react";
import { Activity, Brain, BarChart3, Zap, Shield, LineChart, ArrowRight, Trophy, ChevronRight } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import FeatureCard from "@/components/FeatureCard";
import { Badge } from "@/components/ui/badge";
import { leagues } from "@/lib/leagueData";
import { getAllMatches, getTopEdges, getLeagueIdFromName, filterByLeague } from "@/lib/multiLeagueData";
import { useLeague } from "@/contexts/LeagueContext";
import MatchQuickActions from "@/components/MatchQuickActions";
import { cn } from "@/lib/utils";

const Index = () => {
  const navigate = useNavigate();
  const { setSelectedLeague } = useLeague();
  const [activeLeague, setActiveLeague] = useState("wc");

  const allMatches = useMemo(() => getAllMatches(), []);

  // Filtered upcoming matches based on selected league chip
  const activeLeagueObj = leagues.find(l => l.id === activeLeague);
  const activeLeagueLabel = activeLeagueObj?.shortName ?? "World Cup";
  const activeLeagueLogo = activeLeagueObj?.logo ?? "🏆";

  const filteredUpcoming = useMemo(() =>
    filterByLeague(allMatches, activeLeague)
      .filter(m => m.status === "UPCOMING")
      .slice(0, 5),
  [allMatches, activeLeague]);

  const filteredLive = useMemo(() =>
    filterByLeague(allMatches, activeLeague)
      .filter(m => m.status === "LIVE")
      .slice(0, 3),
  [allMatches, activeLeague]);

  // Top 6 edges across all leagues
  const topEdges = useMemo(() => getTopEdges(allMatches, 6), [allMatches]);

  const handleLeagueChipClick = (leagueId: string) => {
    setActiveLeague(leagueId);
  };

  const handleViewSchedule = () => {
    setSelectedLeague(activeLeague);
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero — World Cup Upcoming */}
      <section className="gradient-hero pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(175_85%_50%/0.06),transparent_60%)]" />
        <div className="container mx-auto text-center relative">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-4 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              World Cup featured • Full multi-league coverage available
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 animate-slide-up-delay-1 leading-tight">
            World Cup Upcoming<br />
            <span className="text-glow text-primary">Bet Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up-delay-2">
            Track upcoming World Cup matches, odds movement, and top edges. 
            AI-powered predictions across all major leagues worldwide.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-3">
            <Link
              to="/dashboard"
              onClick={() => setSelectedLeague("wc")}
              className="gradient-primary text-primary-foreground font-bold px-8 py-3.5 rounded-lg text-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Trophy className="w-5 h-5" />
              View World Cup Schedule
            </Link>
            <Link
              to="/dashboard"
              onClick={() => setSelectedLeague("all")}
              className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono border border-border px-6 py-3 rounded-lg hover:border-primary/30"
            >
              Browse All Leagues →
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "73.2%", label: "Hit Rate" },
              { value: "8", label: "Leagues Tracked" },
              { value: "156", label: "Matches Analyzed" },
              { value: "+18.4%", label: "Avg ROI" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* League Selector Chips + Featured Matches */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* League chips — selectable on homepage */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {leagues.map(l => (
              <button
                key={l.id}
                onClick={() => handleLeagueChipClick(l.id)}
                className={cn(
                  "flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-full border transition-all",
                  activeLeague === l.id
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                )}
              >
                <span>{l.logo}</span>
                {l.shortName}
              </button>
            ))}
          </div>

          {/* Featured matches card — updates per league */}
          <div className="gradient-card rounded-xl border border-primary/20 p-6 card-glow">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="text-lg">{activeLeagueLogo}</span>
                <h3 className="text-lg font-bold text-foreground">{activeLeagueLabel} Matches</h3>
              </div>
              <button
                onClick={handleViewSchedule}
                className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
              >
                See full schedule <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Live matches for this league */}
            {filteredLive.length > 0 && (
              <div className="mb-4">
                <div className="text-[10px] font-mono text-signal-bearish uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-signal-bearish animate-pulse" />
                  Live Now
                </div>
                <div className="space-y-2">
                  {filteredLive.map(m => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border border-signal-bearish/20 bg-signal-bearish/5 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <span>{m.flagHome}</span>
                          <span className="truncate">{m.teamHome}</span>
                          <span className="font-mono text-foreground mx-1">{m.scoreHome}–{m.scoreAway}</span>
                          <span className="truncate">{m.teamAway}</span>
                          <span>{m.flagAway}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                          <Badge variant="outline" className="text-[8px] h-4 px-1 bg-signal-bearish/10 text-signal-bearish border-signal-bearish/30">{m.minute}'</Badge>
                          <span>{m.league}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.edge >= 4 && (
                          <Badge variant="outline" className="text-[9px] font-mono bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30">
                            +{m.edge.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn("text-[9px]",
                          m.confidence === "High" ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" :
                          m.confidence === "Medium" ? "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30" :
                          "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30"
                        )}>
                          {m.confidence}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming */}
            {filteredUpcoming.length === 0 && filteredLive.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No matches found for {activeLeagueLabel}.</p>
            ) : filteredUpcoming.length > 0 ? (
              <>
                {filteredLive.length > 0 && (
                  <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Upcoming</div>
                )}
                <div className="space-y-2">
                  {filteredUpcoming.map(m => (
                    <div key={m.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                          <span>{m.flagHome}</span>
                          <span className="truncate">{m.teamHome}</span>
                          <span className="text-muted-foreground text-xs">vs</span>
                          <span className="truncate">{m.teamAway}</span>
                          <span>{m.flagAway}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground font-mono">
                          <span>{m.kickoffDate}</span>
                          <span>•</span>
                          <span>{m.kickoffLocal}</span>
                          <Badge variant="outline" className="text-[9px] ml-1">{m.league}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {m.edge >= 4 && (
                          <Badge variant="outline" className="text-[9px] font-mono bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30">
                            +{m.edge.toFixed(1)}%
                          </Badge>
                        )}
                        <Badge variant="outline" className={cn("text-[9px]",
                          m.confidence === "High" ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" :
                          m.confidence === "Medium" ? "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30" :
                          "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30"
                        )}>
                          {m.confidence}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* Top Edges Across Leagues */}
      <section className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-mono text-primary uppercase tracking-wider">Signals</span>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">Top Edges Across Leagues</h2>
            </div>
            <Link
              to="/dashboard"
              onClick={() => setSelectedLeague("all")}
              className="text-xs font-mono text-primary hover:underline flex items-center gap-1"
            >
              View all edges <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2">
            {topEdges.map(m => (
              <div key={m.id} className="gradient-card rounded-lg border border-border p-3 flex items-center gap-3 hover:border-primary/30 transition-all group relative">
                <Badge variant="outline" className="text-[9px] font-mono shrink-0 min-w-[70px] justify-center">{m.league}</Badge>
                <div className="flex items-center gap-1.5 flex-1 min-w-0 text-sm text-foreground font-semibold">
                  <span>{m.flagHome}</span>
                  <span className="truncate">{m.teamHome}</span>
                  <span className="text-muted-foreground text-xs">vs</span>
                  <span className="truncate">{m.teamAway}</span>
                  <span>{m.flagAway}</span>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30 shrink-0">
                  +{m.edge.toFixed(1)}% Edge
                </Badge>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0">{m.kickoffLocal}</span>
                <MatchQuickActions matchId={m.linkedMatchId ?? m.id} teamA={m.teamHome} teamB={m.teamAway} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Your Unfair Advantage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={Brain} title="AI Match Predictor" description="Deep learning models trained on 20+ years of football data across all major leagues, updated in real-time." stat="73.2%" statLabel="accuracy" />
            <FeatureCard icon={LineChart} title="Live Odds Tracker" description="Monitor probability shifts across 40+ sportsbooks. Spot value before the market corrects." stat="<2s" statLabel="update latency" />
            <FeatureCard icon={Zap} title="Smart Money Alerts" description="Know where sharp bettors are placing their money. Instant push notifications for line movements." stat="156" statLabel="signals/day" />
            <FeatureCard icon={BarChart3} title="Multi-League Coverage" description="World Cup, Champions League, Premier League, La Liga, Serie A, Bundesliga, Ligue 1, and MLS." stat="8" statLabel="leagues" />
            <FeatureCard icon={Shield} title="Bankroll Manager" description="AI-optimized stake sizing based on Kelly Criterion. Protect your capital with dynamic risk limits." />
            <FeatureCard icon={Activity} title="Performance Analytics" description="Track your betting history, ROI trends, and identify your strongest markets and weaknesses." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">BetIQ</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-lg">
            For entertainment and informational purposes only. BetIQ does not facilitate gambling. 
            Please gamble responsibly and comply with your local jurisdiction's laws.
          </p>
          <div className="text-xs text-muted-foreground">© 2026 BetIQ</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
