import { MatchData } from "./mockData";

export interface Suggestion {
  id: string;
  name: string;
  type: "high-edge" | "momentum" | "safe";
  rationale: string;
  edge: number;
  confidence: "High" | "Medium" | "Low";
  risk: "Low" | "Medium" | "High";
  modelProb: number;
  marketProb: number;
  recentMovement: string;
}

export function generateSuggestions(match: MatchData): Suggestion[] {
  const results: Suggestion[] = [];

  const outcomes: { label: string; modelProb: number; marketProb: number }[] = [
    { label: `${match.teamA} Win (1X2)`, modelProb: match.modelProbA, marketProb: match.marketProbA },
    { label: "Draw", modelProb: match.modelProbDraw, marketProb: match.marketProbDraw },
    { label: `${match.teamB} Win (1X2)`, modelProb: match.modelProbB, marketProb: match.marketProbB },
  ];

  for (const o of outcomes) {
    const edge = o.modelProb - o.marketProb;
    if (edge < 4) continue;

    const confidence: Suggestion["confidence"] = edge >= 7 ? "High" : "Medium";
    const stableMovement = Math.abs(match.lineVelocity) < 2;
    const risk: Suggestion["risk"] = confidence === "High" && stableMovement ? "Low" : "Medium";

    const type: Suggestion["type"] =
      edge >= 7 ? "high-edge" : Math.abs(match.lineVelocity) >= 2 ? "momentum" : "safe";

    const movement =
      match.lineVelocity > 0
        ? `Line moving toward ${match.teamA} (+${match.lineVelocity.toFixed(1)}%/hr)`
        : match.lineVelocity < 0
        ? `Line moving toward ${match.teamB} (${match.lineVelocity.toFixed(1)}%/hr)`
        : "Stable line";

    results.push({
      id: `${match.id}-${o.label}`,
      name: o.label,
      type,
      rationale:
        type === "high-edge"
          ? `Strong model edge of ${edge.toFixed(1)}% with ${confidence.toLowerCase()} confidence.`
          : type === "momentum"
          ? `Market moving in favorable direction with ${edge.toFixed(1)}% edge.`
          : `Stable market with consistent ${edge.toFixed(1)}% edge.`,
      edge,
      confidence,
      risk,
      modelProb: o.modelProb,
      marketProb: o.marketProb,
      recentMovement: movement,
    });
  }

  return results.slice(0, 3);
}
