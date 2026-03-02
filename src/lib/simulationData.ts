// TODO: Replace localStorage with backend persistence when available

import { ScheduleMatch } from "./scheduleData";
import { getAllMatches, getLeagueIdFromName } from "./multiLeagueData";

// ─── Types ──────────────────────────────────────────────────────

export interface PaperBet {
  id: string;
  matchId: string;
  teamHome: string;
  teamAway: string;
  flagHome: string;
  flagAway: string;
  league: string;
  kickoff: string;
  market: "1X2";
  selection: "home" | "draw" | "away";
  selectionLabel: string;
  impliedOdds: number; // decimal odds e.g. 2.08
  modelProb: number;
  edge: number;
  stake: number;
  potentialPayout: number;
  placedAt: string; // ISO timestamp
  status: "open" | "won" | "lost";
  pnl: number; // 0 while open
  matchStatus: "UPCOMING" | "LIVE" | "FT";
}

export interface SimulationState {
  bankroll: number;
  initialBankroll: number;
  bets: PaperBet[];
  contestEntries: string[]; // contest ids
  weeklyBetsCount: number;
  weekStart: string; // ISO date
  maxStakePct: number; // default 10
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  flag: string;
  roi: number;
  bankroll: number;
  winRate: number;
  bets: number;
  maxDrawdown: number;
  score: number; // ROI - 0.25*MaxDrawdown
  badges: ("weekly_winner" | "monthly_champion" | "certified")[];
}

export interface Contest {
  id: string;
  name: string;
  type: "weekly" | "monthly" | "annual";
  startDate: string;
  endDate: string;
  participants: number;
  prizeLabel: string;
  status: "active" | "upcoming" | "completed";
}

export interface CertifiedAnalyst {
  rank: number;
  username: string;
  flag: string;
  year: string;
  roi: number;
  score: number;
  bets: number;
  maxDrawdown: number;
  medal: "gold" | "silver" | "bronze" | "certified";
}

// ─── Constants ──────────────────────────────────────────────────

export const VIRTUAL_CURRENCY = "WW Coins";
export const DEFAULT_BANKROLL = 10000;
export const MAX_STAKE_PCT_DEFAULT = 10;
export const MIN_BETS_TO_RANK = 30;
export const CERTIFICATION_MIN_BETS = 200;
export const CERTIFICATION_MAX_DRAWDOWN = 35;

// ─── localStorage helpers ───────────────────────────────────────

const STORAGE_KEY = "ww_simulation";

export function getSimulationState(): SimulationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return createDefaultState();
}

export function saveSimulationState(state: SimulationState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createDefaultState(): SimulationState {
  return {
    bankroll: DEFAULT_BANKROLL,
    initialBankroll: DEFAULT_BANKROLL,
    bets: [],
    contestEntries: [],
    weeklyBetsCount: 0,
    weekStart: new Date().toISOString().slice(0, 10),
    maxStakePct: MAX_STAKE_PCT_DEFAULT,
  };
}

export function resetSimulation(): SimulationState {
  const s = createDefaultState();
  saveSimulationState(s);
  return s;
}

// ─── Bet helpers ────────────────────────────────────────────────

export function impliedToDecimal(impliedPct: number): number {
  return impliedPct > 0 ? +(100 / impliedPct).toFixed(2) : 1;
}

export function placeBet(
  state: SimulationState,
  match: ScheduleMatch,
  selection: "home" | "draw" | "away",
  stake: number
): SimulationState {
  const impliedPcts = match.marketImplied;
  const selectedImplied = selection === "home" ? impliedPcts.home : selection === "draw" ? impliedPcts.draw : impliedPcts.away;
  const modelProb = selection === "home" ? match.modelProbs.home : selection === "draw" ? match.modelProbs.draw : match.modelProbs.away;
  const decimalOdds = impliedToDecimal(selectedImplied);
  const selectionLabel = selection === "home" ? `${match.teamHome} Win` : selection === "draw" ? "Draw" : `${match.teamAway} Win`;

  const bet: PaperBet = {
    id: `bet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    matchId: match.id,
    teamHome: match.teamHome,
    teamAway: match.teamAway,
    flagHome: match.flagHome,
    flagAway: match.flagAway,
    league: match.league,
    kickoff: `${match.kickoffDate} • ${match.kickoffLocal}`,
    market: "1X2",
    selection,
    selectionLabel,
    impliedOdds: decimalOdds,
    modelProb,
    edge: modelProb - selectedImplied,
    stake,
    potentialPayout: +(stake * decimalOdds).toFixed(2),
    placedAt: new Date().toISOString(),
    status: "open",
    pnl: 0,
    matchStatus: match.status,
  };

  const next: SimulationState = {
    ...state,
    bankroll: +(state.bankroll - stake).toFixed(2),
    bets: [...state.bets, bet],
    weeklyBetsCount: state.weeklyBetsCount + 1,
  };
  saveSimulationState(next);
  return next;
}

// Settle a bet (mock: randomly resolve based on model probs for now)
export function settleBet(state: SimulationState, betId: string, outcome: "home" | "draw" | "away"): SimulationState {
  const next = { ...state, bets: state.bets.map(b => {
    if (b.id !== betId || b.status !== "open") return b;
    const won = b.selection === outcome;
    return {
      ...b,
      status: won ? "won" as const : "lost" as const,
      pnl: won ? +(b.potentialPayout - b.stake).toFixed(2) : -b.stake,
      matchStatus: "FT" as const,
    };
  })};
  // Update bankroll for won bets
  const bet = next.bets.find(b => b.id === betId);
  if (bet && bet.status === "won") {
    next.bankroll = +(next.bankroll + bet.potentialPayout).toFixed(2);
  }
  saveSimulationState(next);
  return next;
}

// Settle all open bets (for demo: use deterministic mock outcomes)
export function settleAllOpenBets(state: SimulationState): SimulationState {
  let next = { ...state };
  const mockOutcomes: Record<string, "home" | "draw" | "away"> = {
    "live-1": "home", "live-2": "draw", "live-3": "away", "live-4": "home", "live-5": "draw",
    "sched-1": "home", "sched-2": "home", "sched-3": "away", "sched-4": "home", "sched-5": "home", "sched-6": "home",
    "epl-1": "home", "epl-2": "home", "laliga-1": "away", "laliga-2": "home",
    "ucl-1": "home", "ucl-2": "home", "seriea-1": "draw", "buli-1": "home", "l1-1": "home", "mls-1": "home",
  };
  for (const bet of next.bets) {
    if (bet.status === "open") {
      const outcome = mockOutcomes[bet.matchId] ?? "home";
      next = settleBet(next, bet.id, outcome);
    }
  }
  return next;
}

// ─── Stats helpers ──────────────────────────────────────────────

export function getStats(bets: PaperBet[]) {
  const settled = bets.filter(b => b.status !== "open");
  const won = settled.filter(b => b.status === "won");
  const totalPnl = settled.reduce((sum, b) => sum + b.pnl, 0);
  const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0);

  // Max drawdown (simplified)
  let peak = 0, dd = 0, maxDd = 0;
  let running = 0;
  for (const b of settled) {
    running += b.pnl;
    if (running > peak) peak = running;
    dd = peak - running;
    if (dd > maxDd) maxDd = dd;
  }

  // Win streak
  let streak = 0, maxStreak = 0, cur = 0;
  for (const b of settled) {
    if (b.status === "won") { cur++; if (cur > maxStreak) maxStreak = cur; }
    else cur = 0;
  }
  // Current streak
  for (let i = settled.length - 1; i >= 0; i--) {
    if (settled[i].status === "won") streak++;
    else break;
  }

  return {
    totalBets: settled.length,
    openBets: bets.filter(b => b.status === "open").length,
    winRate: settled.length > 0 ? +((won.length / settled.length) * 100).toFixed(1) : 0,
    roi: totalStaked > 0 ? +((totalPnl / totalStaked) * 100).toFixed(1) : 0,
    totalPnl: +totalPnl.toFixed(2),
    avgOdds: settled.length > 0 ? +(settled.reduce((s, b) => s + b.impliedOdds, 0) / settled.length).toFixed(2) : 0,
    maxDrawdown: +maxDd.toFixed(2),
    maxDrawdownPct: totalStaked > 0 ? +((maxDd / DEFAULT_BANKROLL) * 100).toFixed(1) : 0,
    longestWinStreak: maxStreak,
    currentStreak: streak,
  };
}

// ─── Mock Leaderboard ───────────────────────────────────────────

const mockNames = [
  "SharpEdge99", "ModelMaster", "BrazilBull", "OddsHunter", "TacticalFox",
  "ProbKing", "EdgeLord", "ValueHawk", "StatsBaron", "LineWizard",
  "CalcGenius", "MarketMind", "PredictorX", "DataDriven", "AlphaSeeker",
  "RiskManager", "FormReader", "CornerKing", "GoalPredict", "SmartStake",
  "BetScientist", "NumbersCrunch", "WinRateKing", "ROIMachine", "DrawHunter",
  "PressurePlay", "VenueExpert", "H2HMaster", "LiveTrader", "DisciplinedBet",
  "InjuryInsight", "TrendSpotter", "VolatilityPro", "CleanSheet", "XGMaster",
  "SetPieceKing", "CounterPunch", "PossessionPro", "HighPressHero", "DeepBlock",
];
const flags = ["🇧🇷", "🇬🇧", "🇩🇪", "🇺🇸", "🇫🇷", "🇪🇸", "🇮🇹", "🇦🇷", "🇳🇱", "🇵🇹", "🇯🇵", "🇰🇷", "🇲🇽", "🇨🇴", "🇳🇬"];

function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export function generateLeaderboard(timeframe: string): LeaderboardEntry[] {
  const seed = timeframe === "weekly" ? 42 : timeframe === "monthly" ? 99 : timeframe === "season" ? 777 : 1234;
  const rng = seededRandom(seed);
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < 100; i++) {
    const roi = +(40 - i * 0.35 + (rng() - 0.5) * 8).toFixed(1);
    const maxDd = +(5 + rng() * 25).toFixed(1);
    const score = +(roi - 0.25 * maxDd).toFixed(1);
    const bets = Math.floor(30 + rng() * 200);
    const badges: LeaderboardEntry["badges"] = [];
    if (i < 3 && timeframe === "weekly") badges.push("weekly_winner");
    if (i < 3 && timeframe === "monthly") badges.push("monthly_champion");
    if (i < 100 && timeframe === "season" && bets >= CERTIFICATION_MIN_BETS && maxDd <= CERTIFICATION_MAX_DRAWDOWN && roi > 0) badges.push("certified");

    entries.push({
      rank: i + 1,
      username: mockNames[i % mockNames.length] + (i >= mockNames.length ? `${Math.floor(i / mockNames.length)}` : ""),
      flag: flags[i % flags.length],
      roi,
      bankroll: +(DEFAULT_BANKROLL + DEFAULT_BANKROLL * roi / 100).toFixed(0),
      winRate: +(55 + rng() * 15 - i * 0.05).toFixed(1),
      bets,
      maxDrawdown: maxDd,
      score,
      badges,
    });
  }
  return entries.sort((a, b) => b.score - a.score).map((e, i) => ({ ...e, rank: i + 1 }));
}

// ─── Mock Contests ──────────────────────────────────────────────

export const mockContests: Contest[] = [
  { id: "wk-1", name: "Weekly Sprint #12", type: "weekly", startDate: "Mar 1, 2026", endDate: "Mar 7, 2026", participants: 1842, prizeLabel: "Top 10 get 'Weekly Winner' badge", status: "active" },
  { id: "wk-2", name: "Weekly Sprint #13", type: "weekly", startDate: "Mar 8, 2026", endDate: "Mar 14, 2026", participants: 0, prizeLabel: "Top 10 get 'Weekly Winner' badge", status: "upcoming" },
  { id: "mo-1", name: "March Madness Season", type: "monthly", startDate: "Mar 1, 2026", endDate: "Mar 31, 2026", participants: 4231, prizeLabel: "Top 3 get 'Monthly Champion' badge", status: "active" },
  { id: "yr-1", name: "2026 Annual Championship", type: "annual", startDate: "Jan 1, 2026", endDate: "Dec 31, 2026", participants: 12847, prizeLabel: "Top 100 earn 'Certified Analyst' status", status: "active" },
];

// ─── Mock Certified Analysts ────────────────────────────────────

export const mockCertifiedAnalysts: CertifiedAnalyst[] = [
  { rank: 1, username: "SharpEdge99", flag: "🇧🇷", year: "2025", roi: 42.3, score: 38.1, bets: 312, maxDrawdown: 16.8, medal: "gold" },
  { rank: 2, username: "ModelMaster", flag: "🇬🇧", year: "2025", roi: 38.7, score: 35.2, bets: 289, maxDrawdown: 14.0, medal: "silver" },
  { rank: 3, username: "OddsHunter", flag: "🇩🇪", year: "2025", roi: 36.1, score: 32.9, bets: 345, maxDrawdown: 12.8, medal: "bronze" },
  ...Array.from({ length: 7 }, (_, i) => ({
    rank: i + 4,
    username: mockNames[(i + 3) % mockNames.length],
    flag: flags[(i + 3) % flags.length],
    year: "2025",
    roi: +(33 - i * 1.5).toFixed(1),
    score: +(30 - i * 1.2).toFixed(1),
    bets: 200 + Math.floor(Math.random() * 150),
    maxDrawdown: +(10 + Math.random() * 15).toFixed(1),
    medal: "certified" as const,
  })),
];

// ─── Bankroll chart mock ────────────────────────────────────────

export function generateBankrollHistory(state: SimulationState): { day: string; value: number }[] {
  const points: { day: string; value: number }[] = [];
  let val = state.initialBankroll;
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon2", "Tue2", "Wed2", "Thu2", "Fri2", "Sat2", "Today"];
  for (const d of days) {
    val += (Math.random() - 0.45) * 200;
    points.push({ day: d, value: +val.toFixed(0) });
  }
  points[points.length - 1].value = state.bankroll;
  return points;
}
