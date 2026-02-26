import { MatchData } from "./mockData";

export interface Suggestion {
  id: string;
  matchId: string;
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
  const suggestions: Suggestion[] = [];

  const edgeA = match.modelProbA - match.marketProbA;
  const edgeB = match.modelProbB - match.marketProbB;

  const confLevel = (edge: number): "High" | "Medium" | "Low" =>
    edge >= 7 ? "High" : edge >= 4 ? "Medium" : "Low";

  const riskLevel = (conf: "High" | "Medium" | "Low", velocity: number): "Low" | "Medium" | "High" =>
    conf === "High" && Math.abs(velocity) < 2 ? "Low" : "Medium";

  const movementDesc = (v: number) =>
    Math.abs(v) < 1 ? "Stable, minimal movement" : v > 0 ? `Rising (+${v.toFixed(1)} velocity)` : `Dropping (${v.toFixed(1)} velocity)`;

  if (edgeA >= 4) {
    const conf = confLevel(edgeA);
    if (conf !== "Low") {
      suggestions.push({
        id: `${match.id}-a`,
        matchId: match.id,
        name: `${match.teamA} Win (1X2)`,
        type: edgeA >= 7 ? "high-edge" : match.lineVelocity > 1.5 ? "momentum" : "safe",
        rationale: `Model sees ${edgeA.toFixed(1)}% edge on ${match.teamA} vs current market pricing.`,
        edge: edgeA,
        confidence: conf,
        risk: riskLevel(conf, match.lineVelocity),
        modelProb: match.modelProbA,
        marketProb: match.marketProbA,
        recentMovement: movementDesc(match.lineVelocity),
      });
    }
  }

  if (edgeB >= 4) {
    const conf = confLevel(edgeB);
    if (conf !== "Low") {
      suggestions.push({
        id: `${match.id}-b`,
        matchId: match.id,
        name: `${match.teamB} Win (1X2)`,
        type: edgeB >= 7 ? "high-edge" : Math.abs(match.lineVelocity) > 1.5 ? "momentum" : "safe",
        rationale: `Model sees ${edgeB.toFixed(1)}% edge on ${match.teamB} vs current market pricing.`,
        edge: edgeB,
        confidence: conf,
        risk: riskLevel(conf, match.lineVelocity),
        modelProb: match.modelProbB,
        marketProb: match.marketProbB,
        recentMovement: movementDesc(-match.lineVelocity),
      });
    }
  }

  return suggestions.slice(0, 3);
}
