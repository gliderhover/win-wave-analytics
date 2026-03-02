// Corners & Cards mock data — future-proof structure

export interface CornersModel {
  predictedRange: [number, number];
  confidence: number;
  homeCornerTendency: {
    crossVolume: number;
    wingPlay: number;
    pressingIntensity: number;
    attackStyleTags: string[];
  };
  awayCornerTendency: {
    crossVolume: number;
    wingPlay: number;
    pressingIntensity: number;
    attackStyleTags: string[];
  };
  marketLens: string[];
  rationale: string[];
  scenarios: { trigger: string; effect: string }[];
}

export interface PlayerCardRisk {
  name: string;
  position: string;
  role: string;
  riskScore: number;
}

export interface CardsModel {
  predictedRange: [number, number];
  confidence: number;
  homeDisciplineScore: number;
  awayDisciplineScore: number;
  disciplineDrivers: {
    pressIntensity: number;
    defensiveLineStress: number;
    rivalryIntensity: number;
    foulPropensity: number;
  };
  refereeFactor: {
    name: string;
    cardsPerMatch: number;
    strictnessRating: number;
  };
  marketLens: string[];
  rationale: string[];
  scenarios: { trigger: string; effect: string }[];
  playerCardRisks: PlayerCardRisk[];
}

export interface MatchCornersCards {
  matchId: string;
  corners: CornersModel;
  cards: CardsModel;
  riskFlags: string[];
}

const cornersCardsData: Record<string, MatchCornersCards> = {
  "1": {
    matchId: "1",
    corners: {
      predictedRange: [9, 13],
      confidence: 72,
      homeCornerTendency: {
        crossVolume: 78,
        wingPlay: 85,
        pressingIntensity: 72,
        attackStyleTags: ["Wide Overload", "Overlapping Fullbacks", "Early Crosses"],
      },
      awayCornerTendency: {
        crossVolume: 65,
        wingPlay: 70,
        pressingIntensity: 85,
        attackStyleTags: ["Half-Space Runs", "Inverted Fullback", "Late Crosses"],
      },
      marketLens: ["Over 9.5 corners", "Brazil team corners over 5.5", "1H corners over 4.5"],
      rationale: [
        "Brazil's width play (85) generates high corner volume historically",
        "Germany's high press forces clearances → corners for Brazil",
        "Both teams play expansive football with wing-focused build-up",
        "Expected 55%+ possession for Brazil → more final-third entries",
      ],
      scenarios: [
        { trigger: "If trailing after 60'", effect: "Corners ↑ — chasing team pushes wide" },
        { trigger: "If wingback starts", effect: "Corners ↑ — extra width on flanks" },
        { trigger: "If red card occurs", effect: "Corners ↓ — reduced attacking output" },
      ],
    },
    cards: {
      predictedRange: [3, 6],
      confidence: 68,
      homeDisciplineScore: 55,
      awayDisciplineScore: 62,
      disciplineDrivers: {
        pressIntensity: 78,
        defensiveLineStress: 72,
        rivalryIntensity: 65,
        foulPropensity: 58,
      },
      refereeFactor: {
        name: "Referee TBD",
        cardsPerMatch: 4.2,
        strictnessRating: 72,
      },
      marketLens: ["Over 3.5 cards", "Germany team cards over 1.5", "Player card: Casemiro"],
      rationale: [
        "High pressing mismatch creates tactical fouling opportunities",
        "Germany's high line under counter-attack stress → strategic fouls",
        "Casemiro's role as anchor man leads to high foul count",
        "Rivalry intensity moderate but knockout pressure adds edge",
        "Transition-heavy match pattern increases card probability",
      ],
      scenarios: [
        { trigger: "High press + rivalry intensity", effect: "Cards risk up" },
        { trigger: "If match becomes tight after 70'", effect: "Cards ↑ — time-wasting fouls" },
        { trigger: "If trailing team pushes hard", effect: "Cards ↑ — desperation fouls" },
      ],
      playerCardRisks: [
        { name: "Casemiro", position: "DM", role: "Anchor Man", riskScore: 82 },
        { name: "Rüdiger", position: "CB", role: "Aggressive CB", riskScore: 75 },
        { name: "Danilo", position: "RB", role: "Fullback", riskScore: 68 },
        { name: "Kimmich", position: "RB/DM", role: "Inverted Fullback", riskScore: 64 },
        { name: "Paquetá", position: "CM", role: "Box-to-Box", riskScore: 58 },
      ],
    },
    riskFlags: [
      "High press + rivalry → cards risk up",
      "Wing dominance → corners up",
      "Transition-heavy pattern → both metrics elevated",
      "Casemiro high foul propensity → player card market value",
    ],
  },
};

export function getMatchCornersCards(matchId: string): MatchCornersCards {
  return cornersCardsData[matchId] ?? cornersCardsData["1"];
}
