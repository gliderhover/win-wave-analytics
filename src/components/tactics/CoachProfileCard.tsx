import { CoachProfile } from "@/lib/tacticsData";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface CoachProfileCardProps {
  coach: CoachProfile;
}

const tendencyLabels: Record<string, string> = {
  pressIntensity: "Press Intensity",
  possessionBias: "Possession Bias",
  directness: "Directness",
  width: "Width",
  defensiveLineHeight: "Defensive Line",
  rotationRate: "Rotation Rate",
  setPieceFocus: "Set-Piece Focus",
  substitutionAggressiveness: "Sub Aggression",
};

const CoachProfileCard = ({ coach }: CoachProfileCardProps) => {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-lg">
          👔
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground">{coach.name}</h4>
          <p className="text-[10px] font-mono text-muted-foreground">{coach.teamName}</p>
        </div>
      </div>

      {/* Favorite Formations */}
      <div>
        <h5 className="text-[10px] font-mono text-muted-foreground mb-2">FAVORITE FORMATIONS</h5>
        <div className="flex gap-2">
          {coach.favoriteFormations.map(f => (
            <div key={f.formation} className="bg-secondary/50 border border-border rounded-lg px-3 py-1.5 text-center">
              <div className="text-xs font-mono font-bold text-primary">{f.formation}</div>
              <div className="text-[9px] text-muted-foreground">{f.usagePct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tendencies */}
      <div>
        <h5 className="text-[10px] font-mono text-muted-foreground mb-2">TACTICAL TENDENCIES</h5>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {Object.entries(coach.tendencies).map(([key, val]) => (
            <div key={key} className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span className="text-muted-foreground">{tendencyLabels[key]}</span>
                <span className="font-mono text-foreground">{val}</span>
              </div>
              <Progress value={val} className="h-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Game State */}
      <div>
        <h5 className="text-[10px] font-mono text-muted-foreground mb-2">GAME STATE BEHAVIOR</h5>
        <div className="space-y-1.5">
          {(["leading", "trailing", "redCard"] as const).map(state => {
            const rule = coach.gameState[state];
            const labels = { leading: "When Leading", trailing: "When Trailing", redCard: "Red Card" };
            return (
              <div key={state} className="flex items-start gap-2 bg-secondary/30 rounded px-2 py-1.5">
                <Badge variant="outline" className="text-[9px] shrink-0 mt-0.5">{labels[state]}</Badge>
                <div>
                  <span className="text-[10px] font-mono text-primary">{rule.shape}</span>
                  <span className="text-[10px] text-muted-foreground ml-1">— {rule.description}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Known Patterns */}
      <div>
        <h5 className="text-[10px] font-mono text-muted-foreground mb-2">KNOWN PATTERNS</h5>
        <ul className="space-y-1">
          {coach.knownPatterns.map((p, i) => (
            <li key={i} className="text-[10px] text-foreground/80 flex items-start gap-1.5">
              <span className="text-primary mt-0.5">•</span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CoachProfileCard;
