export interface MatchData {
  id: string;
  teamA: string;
  teamB: string;
  flagA: string;
  flagB: string;
  kickoff: string;
  modelProbA: number;
  modelProbDraw: number;
  modelProbB: number;
  marketProbA: number;
  marketProbDraw: number;
  marketProbB: number;
  edgeA: number;
  edgeB: number;
  signal: "bullish" | "bearish" | "neutral";
  smartMoney: string;
  steamDetected: boolean;
  lineVelocity: number;
  confidence: number;
  volatility: "low" | "medium" | "high";
  aiInsight: string;
  oddsHistory: { time: string; probA: number; probB: number }[];
}

export const mockMatches: MatchData[] = [
  {
    id: "1",
    teamA: "Brazil", teamB: "Germany", flagA: "🇧🇷", flagB: "🇩🇪",
    kickoff: "Jun 15 • 18:00 UTC",
    modelProbA: 53.2, modelProbDraw: 24.8, modelProbB: 22.0,
    marketProbA: 48.0, marketProbDraw: 26.0, marketProbB: 26.0,
    edgeA: 5.2, edgeB: -4.0,
    signal: "bullish", smartMoney: "Heavy on Brazil", steamDetected: true, lineVelocity: 3.8,
    confidence: 82, volatility: "medium",
    aiInsight: "Brazil's home advantage is significant with a 78% win rate at this venue over the last decade. Germany's key midfielder is returning from injury but lacks match fitness. Our model sees strong value on Brazil at current market prices, with the edge widening in the last 4 hours.",
    oddsHistory: [
      { time: "48h", probA: 45 }, { time: "36h", probA: 46 }, { time: "24h", probA: 47 },
      { time: "18h", probA: 48 }, { time: "12h", probA: 49 }, { time: "6h", probA: 50 },
      { time: "3h", probA: 51 }, { time: "Now", probA: 53.2 },
    ].map(d => ({ ...d, probB: 100 - d.probA - 25 })),
  },
  {
    id: "2",
    teamA: "Argentina", teamB: "France", flagA: "🇦🇷", flagB: "🇫🇷",
    kickoff: "Jun 16 • 20:00 UTC",
    modelProbA: 40.5, modelProbDraw: 28.0, modelProbB: 31.5,
    marketProbA: 42.0, marketProbDraw: 28.0, marketProbB: 30.0,
    edgeA: -1.5, edgeB: 1.5,
    signal: "neutral", smartMoney: "Split market", steamDetected: false, lineVelocity: 0.4,
    confidence: 58, volatility: "high",
    aiInsight: "A rematch of the 2022 final presents a true toss-up. Argentina's recent form shows fatigue from a congested fixture schedule, while France brings fresh legs. No clear edge detected — our model suggests waiting for live in-play opportunities.",
    oddsHistory: [
      { time: "48h", probA: 43 }, { time: "36h", probA: 42 }, { time: "24h", probA: 41 },
      { time: "18h", probA: 41.5 }, { time: "12h", probA: 41 }, { time: "6h", probA: 40.8 },
      { time: "3h", probA: 40.5 }, { time: "Now", probA: 40.5 },
    ].map(d => ({ ...d, probB: 100 - d.probA - 28 })),
  },
  {
    id: "3",
    teamA: "Spain", teamB: "England", flagA: "🇪🇸", flagB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    kickoff: "Jun 17 • 15:00 UTC",
    modelProbA: 35.0, modelProbDraw: 30.0, modelProbB: 35.0,
    marketProbA: 38.0, marketProbDraw: 30.0, marketProbB: 32.0,
    edgeA: -3.0, edgeB: 3.0,
    signal: "bearish", smartMoney: "Fading Spain", steamDetected: true, lineVelocity: -2.1,
    confidence: 71, volatility: "low",
    aiInsight: "Market is overvaluing Spain based on recent Euro success. England's defensive record against possession-dominant teams is elite this cycle. Smart money has been consistently moving toward England over the past 12 hours. Our model sees value on England or the draw.",
    oddsHistory: [
      { time: "48h", probA: 40 }, { time: "36h", probA: 39 }, { time: "24h", probA: 38 },
      { time: "18h", probA: 37 }, { time: "12h", probA: 36 }, { time: "6h", probA: 35.5 },
      { time: "3h", probA: 35 }, { time: "Now", probA: 35 },
    ].map(d => ({ ...d, probB: 100 - d.probA - 30 })),
  },
  {
    id: "4",
    teamA: "Portugal", teamB: "Netherlands", flagA: "🇵🇹", flagB: "🇳🇱",
    kickoff: "Jun 18 • 18:00 UTC",
    modelProbA: 47.0, modelProbDraw: 26.0, modelProbB: 27.0,
    marketProbA: 44.0, marketProbDraw: 28.0, marketProbB: 28.0,
    edgeA: 3.0, edgeB: -1.0,
    signal: "bullish", smartMoney: "Value on Portugal", steamDetected: false, lineVelocity: 1.2,
    confidence: 74, volatility: "medium",
    aiInsight: "Portugal's attacking efficiency has been exceptional this tournament with 2.3 xG per game. Netherlands struggling to create from open play. Our model identifies a moderate edge on Portugal, supported by favorable venue conditions.",
    oddsHistory: [
      { time: "48h", probA: 42 }, { time: "36h", probA: 43 }, { time: "24h", probA: 44 },
      { time: "18h", probA: 45 }, { time: "12h", probA: 45.5 }, { time: "6h", probA: 46 },
      { time: "3h", probA: 46.5 }, { time: "Now", probA: 47 },
    ].map(d => ({ ...d, probB: 100 - d.probA - 26 })),
  },
];

export const performanceData = {
  totalBets: 87,
  winRate: 61.2,
  avgROI: 18.4,
  totalProfit: 2847,
  monthlyData: [
    { month: "Jan", profit: 320, bets: 12, winRate: 58 },
    { month: "Feb", profit: 480, bets: 14, winRate: 64 },
    { month: "Mar", profit: 210, bets: 11, winRate: 55 },
    { month: "Apr", profit: 620, bets: 16, winRate: 69 },
    { month: "May", profit: 540, bets: 15, winRate: 60 },
    { month: "Jun", profit: 677, bets: 19, winRate: 63 },
  ],
  streaks: { current: 4, best: 9 },
  bestMarket: "1X2 Home Win",
  worstMarket: "Both Teams to Score",
};
