// TODO: Replace mock data with API calls when backend is available

export interface EliteTeam {
  id: string;
  name: string;
  country: string;
  flag: string;
  photo_url: string;
  last_updated: string;
  radar_scores: Record<string, number>;
  form_trend: string[];
  tactical_style: string;
  injury_impact: number;
  news_sentiment: number;
  twin_status: "up-to-date" | "updating" | "limited";
  signals: { form: number; fitness: number; cohesion: number; tactics: number; mental: number; market_respect: number };
  timeline: { date: string; event: string; type: "positive" | "negative" | "neutral" }[];
  injuries: { player: string; status: string; severity: "minor" | "moderate" | "major"; expected_return: string }[];
  news: { headline: string; timestamp: string; sentiment: "positive" | "neutral" | "negative" }[];
  h2h_summary: string;
  home_away_split: string;
  goal_timing: string;
}

export interface ElitePlayer {
  id: string;
  name: string;
  country: string;
  club: string;
  flag: string;
  position: string;
  photo_url: string;
  last_updated: string;
  radar_scores: Record<string, number>;
  form_trend: string[];
  minutes_played: number;
  fatigue: "low" | "medium" | "high";
  twin_status: "up-to-date" | "updating" | "limited";
  signals: { form: number; fitness: number; cohesion: number; tactics: number; mental: number; market_respect: number };
  timeline: { date: string; event: string; type: "positive" | "negative" | "neutral" }[];
}

export interface EliteCoach {
  id: string;
  name: string;
  country: string;
  flag: string;
  team: string;
  photo_url: string;
  last_updated: string;
  radar_scores: Record<string, number>;
  formation_preference: string;
  substitution_tendency: string;
  big_match_record: string;
  twin_status: "up-to-date" | "updating" | "limited";
  signals: { form: number; fitness: number; cohesion: number; tactics: number; mental: number; market_respect: number };
  timeline: { date: string; event: string; type: "positive" | "negative" | "neutral" }[];
  controversy_flags: string[];
}

export const teamRadarAxes = ["Attack", "Defense", "Midfield Control", "Set Pieces", "Transition Speed", "Pressing Intensity", "Discipline", "Depth/Rotation"];
export const playerRadarAxes = ["Finishing", "Chance Creation", "Passing", "Ball Carrying", "Defensive Work", "Pace", "Fitness", "Decision Making"];
export const coachRadarAxes = ["Tactical Flexibility", "Game Management", "Player Development", "Substitution Impact", "Defensive Organization", "Attacking Patterns", "Adaptation vs Opponents", "Leadership/Discipline"];

export const eliteTeams: EliteTeam[] = [
  {
    id: "t1", name: "Brazil", country: "Brazil", flag: "🇧🇷", photo_url: "", last_updated: "2026-02-25",
    radar_scores: { Attack: 88, Defense: 72, "Midfield Control": 85, "Set Pieces": 70, "Transition Speed": 90, "Pressing Intensity": 78, Discipline: 65, "Depth/Rotation": 82 },
    form_trend: ["W", "W", "D", "W", "L"],
    tactical_style: "High Press / Transition",
    injury_impact: 22, news_sentiment: 72,
    twin_status: "up-to-date",
    signals: { form: 82, fitness: 75, cohesion: 80, tactics: 85, mental: 70, market_respect: 90 },
    timeline: [
      { date: "Feb 24", event: "Key striker returns to full training", type: "positive" },
      { date: "Feb 22", event: "Tactical shift to 4-2-3-1 in practice", type: "neutral" },
      { date: "Feb 20", event: "Minor hamstring concern for LB", type: "negative" },
    ],
    injuries: [
      { player: "Marquinhos", status: "Doubtful", severity: "moderate", expected_return: "Feb 28" },
      { player: "Richarlison", status: "Available", severity: "minor", expected_return: "Cleared" },
    ],
    news: [
      { headline: "Brazil camp confident ahead of Germany clash", timestamp: "2h ago", sentiment: "positive" },
      { headline: "Formation change signals tactical flexibility", timestamp: "5h ago", sentiment: "neutral" },
      { headline: "Defender picks up knock in training", timestamp: "1d ago", sentiment: "negative" },
    ],
    h2h_summary: "Brazil leads H2H 12-8-5 in last 25 meetings",
    home_away_split: "Home: W68% D18% L14% | Away: W52% D22% L26%",
    goal_timing: "62% of goals scored in 2nd half, peak at 60-75'",
  },
  {
    id: "t2", name: "Germany", country: "Germany", flag: "🇩🇪", photo_url: "", last_updated: "2026-02-25",
    radar_scores: { Attack: 78, Defense: 82, "Midfield Control": 88, "Set Pieces": 75, "Transition Speed": 72, "Pressing Intensity": 85, Discipline: 80, "Depth/Rotation": 78 },
    form_trend: ["W", "D", "W", "W", "W"],
    tactical_style: "Possession / High Press",
    injury_impact: 15, news_sentiment: 68,
    twin_status: "up-to-date",
    signals: { form: 85, fitness: 80, cohesion: 78, tactics: 82, mental: 75, market_respect: 85 },
    timeline: [
      { date: "Feb 24", event: "Full squad available for selection", type: "positive" },
      { date: "Feb 23", event: "Focus on set-piece defending in training", type: "neutral" },
    ],
    injuries: [
      { player: "Wirtz", status: "Fit", severity: "minor", expected_return: "Cleared" },
    ],
    news: [
      { headline: "Germany unbeaten in 5, confidence high", timestamp: "3h ago", sentiment: "positive" },
      { headline: "Coach emphasizes defensive discipline", timestamp: "8h ago", sentiment: "neutral" },
    ],
    h2h_summary: "Germany trails H2H 5-8-12 vs Brazil",
    home_away_split: "Home: W72% D16% L12% | Away: W55% D25% L20%",
    goal_timing: "55% of goals in 1st half, strong early pressure",
  },
  {
    id: "t3", name: "Argentina", country: "Argentina", flag: "🇦🇷", photo_url: "", last_updated: "2026-02-24",
    radar_scores: { Attack: 92, Defense: 70, "Midfield Control": 80, "Set Pieces": 78, "Transition Speed": 85, "Pressing Intensity": 72, Discipline: 68, "Depth/Rotation": 75 },
    form_trend: ["W", "W", "W", "D", "W"],
    tactical_style: "Counter-Attack / Individual Brilliance",
    injury_impact: 10, news_sentiment: 85,
    twin_status: "up-to-date",
    signals: { form: 90, fitness: 72, cohesion: 88, tactics: 78, mental: 92, market_respect: 95 },
    timeline: [
      { date: "Feb 23", event: "Captain in excellent form", type: "positive" },
      { date: "Feb 21", event: "Squad rotation in last friendly", type: "neutral" },
    ],
    injuries: [],
    news: [
      { headline: "Argentina squad fully fit ahead of knockouts", timestamp: "4h ago", sentiment: "positive" },
    ],
    h2h_summary: "Argentina leads H2H vs France 6-3-4",
    home_away_split: "Home: W75% D15% L10% | Away: W50% D28% L22%",
    goal_timing: "Balanced scoring: 48% 1H, 52% 2H",
  },
  {
    id: "t4", name: "France", country: "France", flag: "🇫🇷", photo_url: "", last_updated: "2026-02-25",
    radar_scores: { Attack: 85, Defense: 80, "Midfield Control": 82, "Set Pieces": 72, "Transition Speed": 88, "Pressing Intensity": 80, Discipline: 75, "Depth/Rotation": 90 },
    form_trend: ["W", "L", "W", "W", "D"],
    tactical_style: "Flexible / Transition Speed",
    injury_impact: 18, news_sentiment: 62,
    twin_status: "updating",
    signals: { form: 78, fitness: 82, cohesion: 75, tactics: 80, mental: 70, market_respect: 88 },
    timeline: [
      { date: "Feb 24", event: "Key forward returns from minor knock", type: "positive" },
      { date: "Feb 22", event: "Defensive concern after conceding 3 in friendly", type: "negative" },
    ],
    injuries: [
      { player: "Tchouaméni", status: "Doubtful", severity: "moderate", expected_return: "Mar 1" },
    ],
    news: [
      { headline: "France depth could be decisive factor", timestamp: "6h ago", sentiment: "positive" },
      { headline: "Defensive frailties exposed in warm-up", timestamp: "1d ago", sentiment: "negative" },
    ],
    h2h_summary: "France trails H2H vs Argentina 3-4-6",
    home_away_split: "Home: W70% D20% L10% | Away: W58% D22% L20%",
    goal_timing: "Late game specialists: 40% of goals after 75'",
  },
];

export const elitePlayers: ElitePlayer[] = [
  {
    id: "p1", name: "Vinícius Jr.", country: "Brazil", club: "Real Madrid", flag: "🇧🇷", position: "LW",
    photo_url: "", last_updated: "2026-02-25",
    radar_scores: { Finishing: 82, "Chance Creation": 85, Passing: 72, "Ball Carrying": 95, "Defensive Work": 40, Pace: 96, Fitness: 80, "Decision Making": 75 },
    form_trend: ["⚽", "⚽", "🅰️", "-", "⚽"],
    minutes_played: 420, fatigue: "medium",
    twin_status: "up-to-date",
    signals: { form: 88, fitness: 78, cohesion: 82, tactics: 75, mental: 80, market_respect: 92 },
    timeline: [
      { date: "Feb 24", event: "Scored brace in last club match", type: "positive" },
      { date: "Feb 21", event: "Minor fatigue flagged by physio", type: "negative" },
    ],
  },
  {
    id: "p2", name: "Jamal Musiala", country: "Germany", club: "Bayern Munich", flag: "🇩🇪", position: "AM",
    photo_url: "", last_updated: "2026-02-25",
    radar_scores: { Finishing: 78, "Chance Creation": 88, Passing: 85, "Ball Carrying": 90, "Defensive Work": 55, Pace: 80, Fitness: 85, "Decision Making": 82 },
    form_trend: ["⚽", "🅰️", "🅰️", "⚽", "-"],
    minutes_played: 380, fatigue: "low",
    twin_status: "up-to-date",
    signals: { form: 85, fitness: 88, cohesion: 80, tactics: 82, mental: 78, market_respect: 88 },
    timeline: [
      { date: "Feb 24", event: "Named in starting XI for group stage", type: "positive" },
    ],
  },
  {
    id: "p3", name: "Lionel Messi", country: "Argentina", club: "Inter Miami", flag: "🇦🇷", position: "RW/CF",
    photo_url: "", last_updated: "2026-02-24",
    radar_scores: { Finishing: 90, "Chance Creation": 98, Passing: 95, "Ball Carrying": 88, "Defensive Work": 25, Pace: 60, Fitness: 55, "Decision Making": 97 },
    form_trend: ["⚽", "🅰️", "⚽", "⚽", "🅰️"],
    minutes_played: 350, fatigue: "high",
    twin_status: "up-to-date",
    signals: { form: 92, fitness: 55, cohesion: 95, tactics: 90, mental: 95, market_respect: 98 },
    timeline: [
      { date: "Feb 23", event: "Minutes management plan confirmed", type: "neutral" },
      { date: "Feb 21", event: "Trained separately — precautionary", type: "negative" },
    ],
  },
  {
    id: "p4", name: "Kylian Mbappé", country: "France", club: "Real Madrid", flag: "🇫🇷", position: "CF",
    photo_url: "", last_updated: "2026-02-25",
    radar_scores: { Finishing: 92, "Chance Creation": 80, Passing: 72, "Ball Carrying": 88, "Defensive Work": 35, Pace: 98, Fitness: 82, "Decision Making": 78 },
    form_trend: ["⚽", "-", "⚽", "⚽", "🅰️"],
    minutes_played: 410, fatigue: "medium",
    twin_status: "updating",
    signals: { form: 85, fitness: 80, cohesion: 72, tactics: 75, mental: 82, market_respect: 95 },
    timeline: [
      { date: "Feb 24", event: "Full training session completed", type: "positive" },
      { date: "Feb 22", event: "Adapting to new tactical role", type: "neutral" },
    ],
  },
];

export const eliteCoaches: EliteCoach[] = [
  {
    id: "c1", name: "Dorival Júnior", country: "Brazil", flag: "🇧🇷", team: "Brazil",
    photo_url: "", last_updated: "2026-02-25",
    radar_scores: { "Tactical Flexibility": 72, "Game Management": 78, "Player Development": 80, "Substitution Impact": 70, "Defensive Organization": 68, "Attacking Patterns": 82, "Adaptation vs Opponents": 75, "Leadership/Discipline": 72 },
    formation_preference: "4-2-3-1 / 4-3-3",
    substitution_tendency: "Early subs (55-65') when trailing",
    big_match_record: "W3 D2 L1 in knockout rounds",
    twin_status: "up-to-date",
    signals: { form: 75, fitness: 80, cohesion: 72, tactics: 78, mental: 70, market_respect: 72 },
    timeline: [
      { date: "Feb 24", event: "Confirmed starting formation for opener", type: "neutral" },
    ],
    controversy_flags: [],
  },
  {
    id: "c2", name: "Julian Nagelsmann", country: "Germany", flag: "🇩🇪", team: "Germany",
    photo_url: "", last_updated: "2026-02-25",
    radar_scores: { "Tactical Flexibility": 88, "Game Management": 82, "Player Development": 85, "Substitution Impact": 80, "Defensive Organization": 78, "Attacking Patterns": 85, "Adaptation vs Opponents": 82, "Leadership/Discipline": 75 },
    formation_preference: "4-2-3-1",
    substitution_tendency: "Strategic subs around 60-70'",
    big_match_record: "W5 D1 L2 in major tournaments",
    twin_status: "up-to-date",
    signals: { form: 82, fitness: 85, cohesion: 80, tactics: 88, mental: 78, market_respect: 85 },
    timeline: [
      { date: "Feb 24", event: "Praised squad depth in press conference", type: "positive" },
    ],
    controversy_flags: [],
  },
  {
    id: "c3", name: "Lionel Scaloni", country: "Argentina", flag: "🇦🇷", team: "Argentina",
    photo_url: "", last_updated: "2026-02-24",
    radar_scores: { "Tactical Flexibility": 80, "Game Management": 90, "Player Development": 78, "Substitution Impact": 85, "Defensive Organization": 82, "Attacking Patterns": 78, "Adaptation vs Opponents": 88, "Leadership/Discipline": 85 },
    formation_preference: "4-3-3",
    substitution_tendency: "Late game changers (70'+)",
    big_match_record: "W8 D2 L1 — elite knockout record",
    twin_status: "up-to-date",
    signals: { form: 88, fitness: 82, cohesion: 90, tactics: 85, mental: 92, market_respect: 92 },
    timeline: [
      { date: "Feb 23", event: "Confirmed trust in core XI", type: "positive" },
    ],
    controversy_flags: [],
  },
  {
    id: "c4", name: "Didier Deschamps", country: "France", flag: "🇫🇷", team: "France",
    photo_url: "", last_updated: "2026-02-25",
    radar_scores: { "Tactical Flexibility": 70, "Game Management": 88, "Player Development": 72, "Substitution Impact": 78, "Defensive Organization": 85, "Attacking Patterns": 72, "Adaptation vs Opponents": 80, "Leadership/Discipline": 82 },
    formation_preference: "4-3-3 / 4-2-3-1",
    substitution_tendency: "Conservative — late subs (75'+)",
    big_match_record: "W6 D3 L2 in finals/semis",
    twin_status: "updating",
    signals: { form: 75, fitness: 78, cohesion: 72, tactics: 80, mental: 80, market_respect: 88 },
    timeline: [
      { date: "Feb 24", event: "Defensive restructuring after warm-up loss", type: "negative" },
    ],
    controversy_flags: ["Reported tension with star forward over tactical role"],
  },
];

// Due Diligence risk flags for dashboard snapshot
export const eliteDDSnapshot = {
  topRiskFlag: { text: "Key midfielder questionable — 40% start probability", level: "red" as const },
  topEdgeDriver: { text: "Model favors Brazil +5.2% edge on home advantage & form" },
  injuryImpact: { text: "Brazil injury impact score: 22/100 (moderate concern)" },
};

// DD Report sections for the match
export interface DDSection {
  title: string;
  summary: string;
  details: string[];
}

export const ddReportSections: DDSection[] = [
  {
    title: "Past Match Patterns",
    summary: "Brazil leads H2H 12-8-5 with strong home record",
    details: [
      "Last 5 H2H: Brazil W3 D1 L1",
      "Home/Away: Brazil wins 68% at home vs Germany's 55% away rate",
      "Goal timing: 62% of Brazil goals in 2nd half, Germany strongest in first 30 min",
    ],
  },
  {
    title: "Player Performance",
    summary: "Key attackers in form, midfield fatigue a concern",
    details: [
      "Vinícius Jr: 3 goals, 1 assist in last 5 — elite form",
      "Musiala: 2G 2A — Germany's creative engine",
      "Brazil midfield avg 410 min played — moderate fatigue risk",
    ],
  },
  {
    title: "Injuries & Availability",
    summary: "Brazil: 1 doubtful (Marquinhos). Germany: full strength.",
    details: [
      "Marquinhos — moderate hamstring, 60% to start",
      "Richarlison cleared after minor knock",
      "Germany: Wirtz fully fit, no concerns",
      "Lineup risk score: Brazil 22/100 | Germany 8/100",
    ],
  },
  {
    title: "News & Context",
    summary: "Positive camp vibes for both, Brazil slight edge in morale",
    details: [
      "\"Brazil camp confident ahead of clash\" — 2h ago (Positive)",
      "\"Germany unbeaten in 5\" — 3h ago (Positive)",
      "\"Formation change signals flexibility\" — 5h ago (Neutral)",
    ],
  },
  {
    title: "Coach & Staff Intelligence",
    summary: "Both coaches tactically prepared; Nagelsmann more flexible",
    details: [
      "Dorival: 4-2-3-1 confirmed, early sub tendency when trailing",
      "Nagelsmann: 4-2-3-1, strategic mid-game adjustments",
      "Nagelsmann big-match record slightly better (W5 D1 L2 vs W3 D2 L1)",
      "No controversy flags for either coach",
    ],
  },
  {
    title: "Model Interpretation",
    summary: "Model sees +5.2% edge on Brazil — 3 key drivers identified",
    details: [
      "Driver 1: Home advantage — venue win rate 78% for Brazil",
      "Driver 2: Germany key midfielder returning from injury, lacks match fitness",
      "Driver 3: Market underpricing Brazil's transition speed advantage",
    ],
  },
];

export const riskFlags = [
  { text: "Marquinhos (CB) questionable — 60% to start", level: "red" as const },
  { text: "Brazil midfield fatigue — 410 avg minutes", level: "amber" as const },
  { text: "Germany set-piece threat underrated by model", level: "amber" as const },
  { text: "Home advantage factored — strong green signal", level: "green" as const },
  { text: "No coach controversy flags", level: "green" as const },
];

export const mockSources = [
  { name: "Official Team Release", type: "News" },
  { name: "Physio Report — Brazil FA", type: "Injury report" },
  { name: "Opta Advanced Metrics", type: "Stats feed" },
  { name: "Local Media — São Paulo", type: "News" },
  { name: "UEFA Injury Bulletin", type: "Injury report" },
  { name: "Expected Goals Model v3.2", type: "Stats feed" },
];
