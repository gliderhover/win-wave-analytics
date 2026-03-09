import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BetSlipModal from "@/components/simulation/BetSlipModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLeague } from "@/contexts/LeagueContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { useI18n } from "@/i18n/I18nContext";
import { getAllMatches, filterByLeague } from "@/lib/multiLeagueData";
import {
  getSimulationState, saveSimulationState, getStats, mockContests,
  SimulationState, VIRTUAL_CURRENCY, MIN_BETS_TO_RANK,
} from "@/lib/simulationData";
import { ScheduleMatch } from "@/lib/scheduleData";
import { cn } from "@/lib/utils";
import { Coins, Trophy, BarChart3, Target, TrendingUp, Calendar, Award } from "lucide-react";

const Simulation = () => {
  const { selectedLeague } = useLeague();
  const { isPro } = useUserTier();
  const { t } = useI18n();
  const [simState, setSimState] = useState<SimulationState>(getSimulationState);
  const [betSlipMatch, setBetSlipMatch] = useState<ScheduleMatch | null>(null);

  const allMatches = useMemo(() => getAllMatches(), []);
  const upcomingMatches = useMemo(() =>
    filterByLeague(allMatches, selectedLeague)
      .filter(m => m.status === "UPCOMING" || m.status === "LIVE")
      .slice(0, 8),
  [allMatches, selectedLeague]);

  const stats = getStats(simState.bets);
  const weeklyLimit = isPro ? Infinity : 10;
  const canBet = simState.weeklyBetsCount < weeklyLimit;

  const leagueContestOptions = [
    { key: "all-soccer", label: "All Soccer", contestId: "monthly-global-soccer" },
    { key: "mls", label: "MLS", contestId: "monthly-mls" },
    { key: "epl", label: "Premier League", contestId: "monthly-epl" },
    { key: "fa-cup", label: "FA Cup", contestId: "monthly-global-soccer" },
    { key: "la-liga", label: "La Liga", contestId: "monthly-la-liga" },
    { key: "serie-a", label: "Serie A", contestId: "monthly-serie-a" },
    { key: "bundesliga", label: "Bundesliga", contestId: "monthly-bundesliga" },
    { key: "ligue-1", label: "Ligue 1", contestId: "monthly-ligue1" },
    { key: "eredivisie", label: "Eredivisie", contestId: "monthly-eredivisie" },
    { key: "libertadores", label: "Libertadores", contestId: "monthly-libertadores" },
  ] as const;

  const defaultContestKey = useMemo(() => {
    if (selectedLeague.startsWith("sm:")) {
      const id = selectedLeague.slice(3);
      if (id === "779") return "mls";
      if (id === "8") return "epl";
      if (id === "564") return "la-liga";
      if (id === "384") return "serie-a";
      if (id === "82") return "bundesliga";
      if (id === "301") return "ligue-1";
      if (id === "72") return "eredivisie";
      if (id === "1122") return "libertadores";
      if (id === "24") return "fa-cup";
    }
    return "all-soccer";
  }, [selectedLeague]);

  const [contestLeagueKey, setContestLeagueKey] = useState<string>(defaultContestKey);

  const selectedContest = leagueContestOptions.find((o) => o.key === contestLeagueKey) ?? leagueContestOptions[0];
  const contestCtaLabel =
    selectedContest.key === "all-soccer"
      ? "Join Monthly Global Soccer Contest"
      : `Join Monthly ${selectedContest.label} Contest`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero pt-28 pb-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(175_85%_50%/0.06),transparent_60%)]" />
        <div className="container mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 text-xs font-mono text-signal-neutral bg-signal-neutral/10 px-3 py-1.5 rounded-full mb-4 border border-signal-neutral/20">
            {t("simulation.disclaimer")}
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-foreground mb-4 leading-tight">
            {t("simulation.title").split(" ").slice(0, -1).join(" ")}<br />
            <span className="text-glow text-primary">{t("simulation.title").split(" ").slice(-1)}</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            {t("simulation.heroDesc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <Link
                to={`/simulation/contest?contestId=${selectedContest.contestId}`}
                className="gradient-primary text-primary-foreground font-bold px-8 py-3 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Trophy className="w-5 h-5" /> {contestCtaLabel}
              </Link>
              <Select value={contestLeagueKey} onValueChange={setContestLeagueKey}>
                <SelectTrigger className="h-9 w-[180px] text-xs">
                  <SelectValue placeholder="All Soccer" />
                </SelectTrigger>
                <SelectContent>
                  {leagueContestOptions.map((opt) => (
                    <SelectItem key={opt.key} value={opt.key} className="text-xs">
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Link to="/simulation/leaderboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono border border-border px-6 py-3 rounded-lg hover:border-primary/30">
              {t("simulation.viewLeaderboard")}
            </Link>
          </div>
        </div>
      </section>

      <div className="py-10 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* 1) Your Bankroll */}
            <div className="gradient-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">{t("simulation.yourBankroll")}</h3>
              </div>
              <div className="font-mono text-3xl font-bold text-foreground mb-1">
                {simState.bankroll.toLocaleString()} <span className="text-sm text-muted-foreground">{VIRTUAL_CURRENCY}</span>
              </div>
              <div className={cn("text-sm font-mono mb-4", stats.totalPnl >= 0 ? "text-signal-bullish" : "text-signal-bearish")}>
                {stats.totalPnl >= 0 ? "+" : ""}{stats.totalPnl.toLocaleString()} {t("simulation.pnl")}
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">{t("performance.winRate")}</div>
                  <div className="font-mono text-sm font-bold text-foreground">{stats.winRate}%</div>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2 text-center">
                  <div className="text-[10px] text-muted-foreground">{t("portfolio.roi")}</div>
                  <div className={cn("font-mono text-sm font-bold", stats.roi >= 0 ? "text-signal-bullish" : "text-signal-bearish")}>
                    {stats.roi >= 0 ? "+" : ""}{stats.roi}%
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-3">
                <Target className="w-3 h-3" />
                {stats.totalBets} {t("simulation.bets")} • {stats.openBets} {t("simulation.open")}
                {!isPro && <span className="ml-auto">({simState.weeklyBetsCount}/{weeklyLimit} {t("simulation.thisWeek")})</span>}
              </div>
              <Link to="/simulation/portfolio" className="text-xs font-mono text-primary hover:underline">
                {t("simulation.viewPortfolio")}
              </Link>
            </div>

            {/* 2) Contests */}
            <div className="gradient-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Monthly Contests (Soccer)</h3>
              </div>
              <div className="space-y-3">
                {mockContests.filter(c => c.status !== "completed").map(c => (
                  <div key={c.id} className="bg-secondary/30 rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold text-foreground">{c.name}</span>
                      <Badge variant="outline" className={cn("text-[9px]",
                        c.status === "active" ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" : "bg-secondary text-muted-foreground"
                      )}>
                        {c.status === "active" ? t("common.active") : t("common.upcoming")}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono mb-2">
                      <Calendar className="w-3 h-3 inline mr-1" />{c.startDate} — {c.endDate}
                    </div>
                  <div className="text-[10px] text-muted-foreground mb-1">
                    Monthly Winner Badge • Soccer-only
                  </div>
                  <div className="text-[10px] text-muted-foreground mb-2">
                    Minimum 20 bets • Drawdown-adjusted ranking
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">{c.participants.toLocaleString()} {t("contest.participants").toLowerCase()}</span>
                      <Link to="/simulation/contest">
                        <Button variant="outline" size="sm" className="text-[10px] h-6 px-3">
                          {c.status === "active" ? t("common.view") : t("common.join")}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3) Quick Stats */}
            <div className="gradient-card rounded-xl border border-border p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-foreground">{t("simulation.quickStats")}</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: t("simulation.avgOdds"), value: stats.avgOdds.toFixed(2), icon: "📊" },
                  { label: t("simulation.maxDrawdown"), value: `${stats.maxDrawdownPct}%`, icon: "📉" },
                  { label: t("simulation.winStreak"), value: `${stats.longestWinStreak}`, icon: "🔥" },
                  { label: t("performance.currentStreak"), value: `${stats.currentStreak}W`, icon: "⚡" },
                  {
                    label: "Monthly Badge",
                    value:
                      stats.totalBets >= MIN_BETS_TO_RANK
                        ? "Eligible"
                        : `${stats.totalBets}/${MIN_BETS_TO_RANK} bets`,
                    icon: "🏅",
                  },
                  {
                    label: "Monthly Rank",
                    value: "—", // mock for now
                    icon: "📈",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="flex items-center justify-between bg-secondary/30 rounded-lg p-2.5"
                  >
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <span>{s.icon}</span> {s.label}
                    </span>
                    <span className="font-mono text-sm font-bold text-foreground">
                      {s.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/simulation/leaderboard" className="text-xs font-mono text-primary hover:underline">{t("leaderboard.title")} →</Link>
                <Link to="/simulation/certification" className="text-xs font-mono text-primary hover:underline">{t("certification.title")} →</Link>
              </div>
            </div>
          </div>

          {/* Today's Matches */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">{t("simulation.todaysMatches")}</h3>
              {!canBet && !isPro && (
                <Badge variant="outline" className="text-[9px] bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30">
                  {t("simulation.weeklyLimitReached")}
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              {upcomingMatches.map(m => {
                const bestEdge = Math.max(
                  m.modelProbs.home - m.marketImplied.home,
                  m.modelProbs.draw - m.marketImplied.draw,
                  m.modelProbs.away - m.marketImplied.away
                );
                return (
                  <div key={m.id} className="gradient-card rounded-lg border border-border p-4 flex items-center gap-3">
                    <Badge variant="outline" className="text-[8px] font-mono shrink-0 min-w-[60px] justify-center">{m.league}</Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                        <span>{m.flagHome}</span>
                        <span className="truncate">{m.teamHome}</span>
                        <span className="text-muted-foreground text-xs">{t("common.vs")}</span>
                        <span className="truncate">{m.teamAway}</span>
                        <span>{m.flagAway}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                        {m.kickoffDate} • {m.kickoffLocal}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {bestEdge >= 3 && (
                        <Badge variant="outline" className="text-[9px] font-mono bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30">
                          +{bestEdge.toFixed(1)}%
                        </Badge>
                      )}
                      <Badge variant="outline" className={cn("text-[9px]",
                        m.confidence === "High" ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" :
                        "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30"
                      )}>
                        {m.confidence}
                      </Badge>
                      <Button
                        size="sm"
                        className="text-[10px] h-7 gradient-primary text-primary-foreground font-semibold"
                        onClick={() => setBetSlipMatch(m)}
                        disabled={!canBet}
                      >
                        {t("simulation.simulateBet")}
                      </Button>
                    </div>
                  </div>
                );
              })}
              {upcomingMatches.length === 0 && (
                <div className="gradient-card rounded-xl border border-border p-8 text-center">
                  <p className="text-sm text-muted-foreground">{t("simulation.noMatches")}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-muted-foreground font-mono">
            {t("simulation.footerDisclaimer")}
          </div>
        </div>
      </div>

      {betSlipMatch && (
        <BetSlipModal
          open={!!betSlipMatch}
          onClose={() => setBetSlipMatch(null)}
          match={betSlipMatch}
          simState={simState}
          onBetPlaced={s => { setSimState(s); }}
        />
      )}
    </div>
  );
};

export default Simulation;
