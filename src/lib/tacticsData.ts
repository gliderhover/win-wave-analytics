// Tactics & Formation mock data — future-proof structure for real lineup/news feeds

export type Fitness = "fit" | "doubt" | "out";
export type PositionRole = "GK" | "CB" | "LB" | "RB" | "LWB" | "RWB" | "DM" | "CM" | "AM" | "LW" | "RW" | "LM" | "RM" | "ST" | "CF";

export interface Player {
  id: string;
  name: string;
  shortName: string;
  number: number;
  primaryPosition: PositionRole;
  secondaryPositions: PositionRole[];
  fitness: Fitness;
  roleTags: string[]; // e.g. "Inverted Winger", "Regista", "Target Man"
  height?: number;
  pace?: number;
}

export interface PositionedPlayer {
  playerId: string;
  x: number; // 0-100 across pitch width
  y: number; // 0-100 pitch length (0=own goal, 100=opponent goal)
  role: PositionRole;
  isStarting: boolean;
}

export interface FormationSnapshot {
  formation: string; // e.g. "4-3-3"
  positions: PositionedPlayer[];
}

export interface ShapeChangeEvent {
  minute: number;
  type: "goal" | "red_card" | "substitution" | "formation_change";
  label: string;
  reason: string;
  newFormation: string;
  newPositions: PositionedPlayer[];
}

export interface MatchLineup {
  matchId: string;
  homeFormation: FormationSnapshot;
  awayFormation: FormationSnapshot;
  homeBench: string[]; // player IDs
  awayBench: string[];
  homeShapeChanges: ShapeChangeEvent[];
  awayShapeChanges: ShapeChangeEvent[];
  homePressShape?: string;
  awayPressShape?: string;
}

export interface CoachTendencies {
  pressIntensity: number;
  possessionBias: number;
  directness: number;
  width: number;
  defensiveLineHeight: number;
  rotationRate: number;
  setPieceFocus: number;
  substitutionAggressiveness: number;
}

export interface GameStateRule {
  shape: string;
  description: string;
}

export interface CoachProfile {
  coachId: string;
  name: string;
  teamId: string;
  teamName: string;
  favoriteFormations: { formation: string; usagePct: number }[];
  tendencies: CoachTendencies;
  gameState: {
    leading: GameStateRule;
    trailing: GameStateRule;
    redCard: GameStateRule;
  };
  knownPatterns: string[];
}

export interface TacticalSignal {
  name: string;
  icon: string;
  score: number;
  explanation: string[];
  impactTags: string[];
  eliteOnly?: boolean;
}

export interface MatchTacticalSignals {
  matchId: string;
  signals: TacticalSignal[];
  lineupVolatility: {
    score: number;
    drivers: string[];
    scenarios: { label: string; altFormation: string; edgeShift: number }[];
  };
  lastUpdate: string;
}

// ── PLAYERS ──
export const players: Record<string, Player> = {
  // Brazil
  "br-1": { id: "br-1", name: "Alisson Becker", shortName: "Alisson", number: 1, primaryPosition: "GK", secondaryPositions: [], fitness: "fit", roleTags: ["Sweeper Keeper"] },
  "br-2": { id: "br-2", name: "Danilo", shortName: "Danilo", number: 2, primaryPosition: "RB", secondaryPositions: ["CB"], fitness: "fit", roleTags: ["Overlapping Fullback"] },
  "br-3": { id: "br-3", name: "Marquinhos", shortName: "Marquinhos", number: 4, primaryPosition: "CB", secondaryPositions: ["DM"], fitness: "fit", roleTags: ["Ball-Playing CB"], height: 183 },
  "br-4": { id: "br-4", name: "Thiago Silva", shortName: "T. Silva", number: 3, primaryPosition: "CB", secondaryPositions: [], fitness: "doubt", roleTags: ["Deep Defender"], height: 181 },
  "br-5": { id: "br-5", name: "Alex Sandro", shortName: "A. Sandro", number: 6, primaryPosition: "LB", secondaryPositions: ["LWB"], fitness: "fit", roleTags: ["Wingback"] },
  "br-6": { id: "br-6", name: "Casemiro", shortName: "Casemiro", number: 5, primaryPosition: "DM", secondaryPositions: ["CB"], fitness: "fit", roleTags: ["Anchor Man", "Double Pivot"] },
  "br-7": { id: "br-7", name: "Lucas Paquetá", shortName: "Paquetá", number: 10, primaryPosition: "CM", secondaryPositions: ["AM"], fitness: "fit", roleTags: ["Box-to-Box", "Half-Space Runner"] },
  "br-8": { id: "br-8", name: "Bruno Guimarães", shortName: "B. Guimarães", number: 8, primaryPosition: "CM", secondaryPositions: ["DM"], fitness: "fit", roleTags: ["Regista"] },
  "br-9": { id: "br-9", name: "Vinícius Jr.", shortName: "Vinícius", number: 7, primaryPosition: "LW", secondaryPositions: ["ST"], fitness: "fit", roleTags: ["Inverted Winger", "Dribbler"], pace: 95 },
  "br-10": { id: "br-10", name: "Raphinha", shortName: "Raphinha", number: 11, primaryPosition: "RW", secondaryPositions: ["AM"], fitness: "fit", roleTags: ["Wide Playmaker"], pace: 88 },
  "br-11": { id: "br-11", name: "Richarlison", shortName: "Richarlison", number: 9, primaryPosition: "ST", secondaryPositions: ["LW"], fitness: "fit", roleTags: ["Target Man", "Pressing Forward"], height: 184 },
  "br-12": { id: "br-12", name: "Ederson", shortName: "Ederson", number: 23, primaryPosition: "GK", secondaryPositions: [], fitness: "fit", roleTags: [] },
  "br-13": { id: "br-13", name: "Éder Militão", shortName: "Militão", number: 14, primaryPosition: "CB", secondaryPositions: ["RB"], fitness: "fit", roleTags: [] },
  "br-14": { id: "br-14", name: "Rodrygo", shortName: "Rodrygo", number: 21, primaryPosition: "RW", secondaryPositions: ["ST", "LW"], fitness: "fit", roleTags: [], pace: 90 },
  "br-15": { id: "br-15", name: "Endrick", shortName: "Endrick", number: 19, primaryPosition: "ST", secondaryPositions: [], fitness: "fit", roleTags: ["Poacher"], pace: 87 },

  // Germany
  "de-1": { id: "de-1", name: "Manuel Neuer", shortName: "Neuer", number: 1, primaryPosition: "GK", secondaryPositions: [], fitness: "fit", roleTags: ["Sweeper Keeper"] },
  "de-2": { id: "de-2", name: "Joshua Kimmich", shortName: "Kimmich", number: 6, primaryPosition: "RB", secondaryPositions: ["DM", "CM"], fitness: "fit", roleTags: ["Inverted Fullback", "Playmaker"] },
  "de-3": { id: "de-3", name: "Antonio Rüdiger", shortName: "Rüdiger", number: 2, primaryPosition: "CB", secondaryPositions: [], fitness: "fit", roleTags: ["Aggressive CB"], height: 190 },
  "de-4": { id: "de-4", name: "Jonathan Tah", shortName: "Tah", number: 4, primaryPosition: "CB", secondaryPositions: [], fitness: "fit", roleTags: ["Ball-Playing CB"], height: 195 },
  "de-5": { id: "de-5", name: "David Raum", shortName: "Raum", number: 3, primaryPosition: "LB", secondaryPositions: ["LWB"], fitness: "fit", roleTags: ["Overlapping Fullback"] },
  "de-6": { id: "de-6", name: "İlkay Gündoğan", shortName: "Gündoğan", number: 21, primaryPosition: "CM", secondaryPositions: ["AM"], fitness: "doubt", roleTags: ["Deep-Lying Playmaker"] },
  "de-7": { id: "de-7", name: "Toni Kroos", shortName: "Kroos", number: 8, primaryPosition: "DM", secondaryPositions: ["CM"], fitness: "fit", roleTags: ["Regista", "Metronome"] },
  "de-8": { id: "de-8", name: "Florian Wirtz", shortName: "Wirtz", number: 10, primaryPosition: "AM", secondaryPositions: ["RW", "CM"], fitness: "fit", roleTags: ["Playmaker", "Half-Space Runner"], pace: 85 },
  "de-9": { id: "de-9", name: "Jamal Musiala", shortName: "Musiala", number: 14, primaryPosition: "LW", secondaryPositions: ["AM", "CM"], fitness: "fit", roleTags: ["Dribbler", "Inverted Winger"], pace: 84 },
  "de-10": { id: "de-10", name: "Leroy Sané", shortName: "Sané", number: 19, primaryPosition: "RW", secondaryPositions: ["LW"], fitness: "fit", roleTags: ["Pace Merchant", "Wide Dribbler"], pace: 93 },
  "de-11": { id: "de-11", name: "Kai Havertz", shortName: "Havertz", number: 9, primaryPosition: "ST", secondaryPositions: ["AM", "CF"], fitness: "fit", roleTags: ["False Nine", "Target Man"], height: 189 },
  "de-12": { id: "de-12", name: "Marc-André ter Stegen", shortName: "Ter Stegen", number: 22, primaryPosition: "GK", secondaryPositions: [], fitness: "fit", roleTags: [] },
  "de-13": { id: "de-13", name: "Nico Schlotterbeck", shortName: "Schlotterbeck", number: 23, primaryPosition: "CB", secondaryPositions: [], fitness: "fit", roleTags: [] },
  "de-14": { id: "de-14", name: "Niclas Füllkrug", shortName: "Füllkrug", number: 11, primaryPosition: "ST", secondaryPositions: [], fitness: "fit", roleTags: ["Target Man"], height: 189 },
  "de-15": { id: "de-15", name: "Thomas Müller", shortName: "Müller", number: 13, primaryPosition: "CF", secondaryPositions: ["AM", "RW"], fitness: "fit", roleTags: ["Raumdeuter"] },
};

// ── FORMATION POSITION TEMPLATES ──
// x: 0-100 (left-right), y: 0-100 (own goal → opponent goal)
const formationTemplates: Record<string, { x: number; y: number; role: PositionRole }[]> = {
  "4-3-3": [
    { x: 50, y: 5, role: "GK" },
    { x: 80, y: 25, role: "RB" }, { x: 62, y: 20, role: "CB" }, { x: 38, y: 20, role: "CB" }, { x: 20, y: 25, role: "LB" },
    { x: 65, y: 45, role: "CM" }, { x: 50, y: 38, role: "DM" }, { x: 35, y: 45, role: "CM" },
    { x: 78, y: 70, role: "RW" }, { x: 50, y: 75, role: "ST" }, { x: 22, y: 70, role: "LW" },
  ],
  "4-2-3-1": [
    { x: 50, y: 5, role: "GK" },
    { x: 80, y: 25, role: "RB" }, { x: 62, y: 20, role: "CB" }, { x: 38, y: 20, role: "CB" }, { x: 20, y: 25, role: "LB" },
    { x: 60, y: 40, role: "DM" }, { x: 40, y: 40, role: "DM" },
    { x: 78, y: 60, role: "RW" }, { x: 50, y: 58, role: "AM" }, { x: 22, y: 60, role: "LW" },
    { x: 50, y: 78, role: "ST" },
  ],
  "5-3-2": [
    { x: 50, y: 5, role: "GK" },
    { x: 85, y: 25, role: "RWB" }, { x: 65, y: 18, role: "CB" }, { x: 50, y: 15, role: "CB" }, { x: 35, y: 18, role: "CB" }, { x: 15, y: 25, role: "LWB" },
    { x: 65, y: 45, role: "CM" }, { x: 50, y: 40, role: "DM" }, { x: 35, y: 45, role: "CM" },
    { x: 60, y: 72, role: "ST" }, { x: 40, y: 72, role: "ST" },
  ],
  "4-4-2": [
    { x: 50, y: 5, role: "GK" },
    { x: 80, y: 25, role: "RB" }, { x: 62, y: 20, role: "CB" }, { x: 38, y: 20, role: "CB" }, { x: 20, y: 25, role: "LB" },
    { x: 80, y: 50, role: "RM" }, { x: 60, y: 45, role: "CM" }, { x: 40, y: 45, role: "CM" }, { x: 20, y: 50, role: "LM" },
    { x: 60, y: 72, role: "ST" }, { x: 40, y: 72, role: "ST" },
  ],
  "3-4-3": [
    { x: 50, y: 5, role: "GK" },
    { x: 70, y: 18, role: "CB" }, { x: 50, y: 15, role: "CB" }, { x: 30, y: 18, role: "CB" },
    { x: 85, y: 40, role: "RWB" }, { x: 60, y: 42, role: "CM" }, { x: 40, y: 42, role: "CM" }, { x: 15, y: 40, role: "LWB" },
    { x: 75, y: 70, role: "RW" }, { x: 50, y: 75, role: "ST" }, { x: 25, y: 70, role: "LW" },
  ],
  "5-4-1": [
    { x: 50, y: 5, role: "GK" },
    { x: 85, y: 22, role: "RWB" }, { x: 65, y: 17, role: "CB" }, { x: 50, y: 14, role: "CB" }, { x: 35, y: 17, role: "CB" }, { x: 15, y: 22, role: "LWB" },
    { x: 78, y: 42, role: "RM" }, { x: 58, y: 40, role: "CM" }, { x: 42, y: 40, role: "CM" }, { x: 22, y: 42, role: "LM" },
    { x: 50, y: 70, role: "ST" },
  ],
};

function buildPositions(formation: string, playerIds: string[]): PositionedPlayer[] {
  const template = formationTemplates[formation] ?? formationTemplates["4-3-3"];
  return template.map((pos, i) => ({
    playerId: playerIds[i] ?? `unknown-${i}`,
    x: pos.x,
    y: pos.y,
    role: pos.role,
    isStarting: true,
  }));
}

// ── MATCH LINEUPS ──
export const matchLineups: Record<string, MatchLineup> = {
  "1": {
    matchId: "1",
    homeFormation: {
      formation: "4-3-3",
      positions: buildPositions("4-3-3", ["br-1", "br-2", "br-3", "br-4", "br-5", "br-6", "br-7", "br-8", "br-9", "br-11", "br-10"]),
    },
    awayFormation: {
      formation: "4-2-3-1",
      positions: buildPositions("4-2-3-1", ["de-1", "de-2", "de-3", "de-4", "de-5", "de-7", "de-6", "de-10", "de-8", "de-9", "de-11"]),
    },
    homeBench: ["br-12", "br-13", "br-14", "br-15"],
    awayBench: ["de-12", "de-13", "de-14", "de-15"],
    homeShapeChanges: [
      { minute: 35, type: "goal", label: "Goal: Vinícius 35'", reason: "Counter-attack after pressing win", newFormation: "4-3-3", newPositions: buildPositions("4-3-3", ["br-1", "br-2", "br-3", "br-4", "br-5", "br-6", "br-7", "br-8", "br-9", "br-11", "br-10"]) },
      { minute: 70, type: "formation_change", label: "Shape change 70'", reason: "Protecting lead — dropped deeper", newFormation: "5-4-1", newPositions: buildPositions("5-4-1", ["br-1", "br-2", "br-3", "br-4", "br-13", "br-5", "br-10", "br-6", "br-7", "br-8", "br-11"]) },
      { minute: 78, type: "substitution", label: "Sub: Endrick for Vinícius 78'", reason: "Fresh legs for counter-attack", newFormation: "5-4-1", newPositions: buildPositions("5-4-1", ["br-1", "br-2", "br-3", "br-4", "br-13", "br-5", "br-10", "br-6", "br-7", "br-8", "br-15"]) },
    ],
    awayShapeChanges: [
      { minute: 55, type: "substitution", label: "Sub: Füllkrug for Gündoğan 55'", reason: "Chasing goal — more aerial threat", newFormation: "4-4-2", newPositions: buildPositions("4-4-2", ["de-1", "de-2", "de-3", "de-4", "de-5", "de-10", "de-7", "de-8", "de-9", "de-14", "de-11"]) },
      { minute: 70, type: "formation_change", label: "All-out attack 70'", reason: "Chasing goal — 3-at-the-back", newFormation: "3-4-3", newPositions: buildPositions("3-4-3", ["de-1", "de-3", "de-4", "de-2", "de-10", "de-7", "de-8", "de-9", "de-14", "de-11", "de-15"]) },
    ],
    homePressShape: "4-4-2",
    awayPressShape: "4-4-2",
  },
};

// Generate default lineups for any match
export function getMatchLineup(matchId: string): MatchLineup {
  if (matchLineups[matchId]) return matchLineups[matchId];
  // Generate default for unknown matches
  return {
    matchId,
    homeFormation: { formation: "4-3-3", positions: buildPositions("4-3-3", ["br-1", "br-2", "br-3", "br-4", "br-5", "br-6", "br-7", "br-8", "br-9", "br-11", "br-10"]) },
    awayFormation: { formation: "4-2-3-1", positions: buildPositions("4-2-3-1", ["de-1", "de-2", "de-3", "de-4", "de-5", "de-7", "de-6", "de-10", "de-8", "de-9", "de-11"]) },
    homeBench: ["br-12", "br-13", "br-14", "br-15"],
    awayBench: ["de-12", "de-13", "de-14", "de-15"],
    homeShapeChanges: [],
    awayShapeChanges: [],
    homePressShape: "4-4-2",
    awayPressShape: "4-4-2",
  };
}

// ── COACH PROFILES ──
export const coachProfiles: Record<string, CoachProfile> = {
  brazil: {
    coachId: "coach-br",
    name: "Dorival Júnior",
    teamId: "brazil",
    teamName: "Brazil",
    favoriteFormations: [
      { formation: "4-3-3", usagePct: 65 },
      { formation: "4-2-3-1", usagePct: 25 },
      { formation: "5-3-2", usagePct: 10 },
    ],
    tendencies: {
      pressIntensity: 72,
      possessionBias: 68,
      directness: 55,
      width: 80,
      defensiveLineHeight: 62,
      rotationRate: 40,
      setPieceFocus: 58,
      substitutionAggressiveness: 65,
    },
    gameState: {
      leading: { shape: "5-4-1", description: "Drops into compact 5-4-1 block, plays on counter" },
      trailing: { shape: "4-2-3-1", description: "Pushes fullbacks high, switches to 4-2-3-1 with wide overloads" },
      redCard: { shape: "4-4-1", description: "Sacrifices a midfielder, maintains defensive solidity" },
    },
    knownPatterns: [
      "Early subs (often before 60') to change game tempo",
      "Fullback overlap on both sides — high cross volume",
      "Double pivot only when protecting leads",
      "Vinícius given freedom to roam left channel",
      "Set-piece routines emphasize near-post runs",
    ],
  },
  germany: {
    coachId: "coach-de",
    name: "Julian Nagelsmann",
    teamId: "germany",
    teamName: "Germany",
    favoriteFormations: [
      { formation: "4-2-3-1", usagePct: 55 },
      { formation: "3-4-3", usagePct: 30 },
      { formation: "4-3-3", usagePct: 15 },
    ],
    tendencies: {
      pressIntensity: 85,
      possessionBias: 75,
      directness: 45,
      width: 70,
      defensiveLineHeight: 78,
      rotationRate: 55,
      setPieceFocus: 50,
      substitutionAggressiveness: 72,
    },
    gameState: {
      leading: { shape: "4-2-3-1", description: "Maintains shape but drops tempo, inverts Kimmich" },
      trailing: { shape: "3-4-3", description: "Moves to 3-4-3 with Kimmich in midfield, adds striker" },
      redCard: { shape: "4-4-1", description: "Falls into deep 4-4-1, relies on transition" },
    },
    knownPatterns: [
      "Late subs — trusts starting XI until 70'+",
      "Kimmich inverts from RB into midfield in possession",
      "Single pivot preferred (Kroos) in big matches",
      "Musiala and Wirtz rotate freely in half-spaces",
      "High pressing trap — forces long balls from opponents",
    ],
  },
};

export function getCoachProfile(teamKey: string): CoachProfile {
  return coachProfiles[teamKey] ?? coachProfiles.brazil;
}

// ── TACTICAL SIGNALS ──
export const matchTacticalSignals: Record<string, MatchTacticalSignals> = {
  "1": {
    matchId: "1",
    signals: [
      { name: "Pressing Mismatch", icon: "⚡", score: 78, explanation: ["Brazil's high-press vs Germany's build-up", "Germany's CBs comfortable on ball but under-matched pace", "Expect turnovers in Germany's half"], impactTags: ["1X2", "Over/Under", "Cards"] },
      { name: "Width Advantage", icon: "↔️", score: 82, explanation: ["Brazil's Vinícius + Raphinha stretch pitch wide", "Germany's fullbacks pushed high = space behind", "Wing overload likely on Brazil's left"], impactTags: ["1X2", "Both Teams To Score", "Corners"] },
      { name: "Midfield Control", icon: "🎯", score: 65, explanation: ["Casemiro anchors Brazil's double pivot option", "Kroos vs Paquetá battle for tempo control", "Balanced: slight edge Brazil in physical duels"], impactTags: ["1X2", "Draw No Bet"] },
      { name: "Transition Risk", icon: "🚀", score: 88, explanation: ["Germany's high line (78 tendency) vs Vinícius pace (95)", "Counter-attack is Brazil's primary threat", "5+ fast-break chances expected"], impactTags: ["Over/Under", "1X2", "Asian Handicap"], eliteOnly: false },
      { name: "Set-Piece Edge", icon: "🎪", score: 55, explanation: ["Germany taller on average (Rüdiger 190, Tah 195)", "Brazil's near-post runs effective at 42% conversion", "Marginal edge Germany in aerial duels"], impactTags: ["Corners", "Over/Under"] },
      { name: "Fullback Matchup", icon: "🔀", score: 74, explanation: ["Danilo vs Musiala: pace mismatch", "Raum vs Raphinha: crossing duel", "High cross volume expected from both sides"], impactTags: ["Corners", "Both Teams To Score"] },
      { name: "Striker vs CB Profile", icon: "⚔️", score: 70, explanation: ["Richarlison (184cm, target man) vs Tah (195cm)", "Havertz (false nine) vs Marquinhos: mobility battle", "Expect Richarlison to drift wide"], impactTags: ["1X2", "Over/Under"] },
      { name: "Injury Impact on Shape", icon: "🏥", score: 62, explanation: ["T. Silva (doubt) — if out, Militão steps in", "Gündoğan (doubt) — if out, Müller or Wirtz deeper", "Shape stability moderate for both sides"], impactTags: ["1X2", "Asian Handicap"] },
      { name: "Substitution Leverage", icon: "🔄", score: 71, explanation: ["Brazil: Endrick + Rodrygo high-impact options", "Germany: Füllkrug adds aerial threat, Müller adds movement", "Brazil's bench slightly stronger for game-changing subs"], impactTags: ["Over/Under", "1X2"] },
      { name: "Shape Shift Likelihood", icon: "🔁", score: 80, explanation: ["Brazil 65% to switch to 5-4-1 if leading after 60'", "Germany 70% to switch to 3-4-3 if trailing", "Expect tactical chess in final 30 minutes"], impactTags: ["1X2", "Over/Under", "Asian Handicap"], eliteOnly: true },
    ],
    lineupVolatility: {
      score: 42,
      drivers: [
        "Thiago Silva fitness doubt — 40% chance of missing",
        "Gündoğan questionable — 55% chance available",
        "Low rotation probability (knockout stage)",
        "No fixture congestion — both teams rested",
      ],
      scenarios: [
        { label: "If T. Silva is out", altFormation: "4-3-3 (Militão in)", edgeShift: -1.2 },
        { label: "If Gündoğan is out", altFormation: "4-3-3 (Müller in AM)", edgeShift: +0.8 },
        { label: "If both out", altFormation: "Both adapt", edgeShift: -0.5 },
      ],
    },
    lastUpdate: "2 hours ago",
  },
};

export function getMatchTacticalSignals(matchId: string): MatchTacticalSignals {
  return matchTacticalSignals[matchId] ?? matchTacticalSignals["1"];
}
