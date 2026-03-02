import { useState } from "react";
import { useUserTier } from "@/contexts/UserTierContext";
import { FormationSnapshot, PositionedPlayer, players } from "@/lib/tacticsData";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface PitchVisualizationProps {
  homeFormation: FormationSnapshot;
  awayFormation: FormationSnapshot;
  homeTeam: string;
  awayTeam: string;
  homePressShape?: string;
  awayPressShape?: string;
}

const fitnessColor: Record<string, string> = {
  fit: "border-accent",
  doubt: "border-warning",
  out: "border-destructive",
};

const fitnessBg: Record<string, string> = {
  fit: "bg-accent/20",
  doubt: "bg-warning/20",
  out: "bg-destructive/20",
};

const PlayerNode = ({ pos, isAway }: { pos: PositionedPlayer; isAway: boolean }) => {
  const player = players[pos.playerId];
  if (!player) return null;

  // Mirror away team (top half)
  const nodeX = isAway ? 100 - pos.x : pos.x;
  const nodeY = isAway ? 100 - pos.y : pos.y;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className="absolute flex flex-col items-center -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-10"
          style={{ left: `${nodeX}%`, top: `${nodeY}%` }}
        >
          <div className={cn(
            "w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all",
            fitnessColor[player.fitness],
            fitnessBg[player.fitness],
            isAway ? "text-foreground bg-secondary/80" : "text-primary-foreground bg-primary/30",
            "group-hover:scale-110 group-hover:shadow-[0_0_12px_hsl(var(--primary)/0.4)]"
          )}>
            {player.number}
          </div>
          <span className="text-[8px] sm:text-[10px] font-mono text-foreground/80 mt-0.5 whitespace-nowrap leading-none">
            {player.shortName}
          </span>
          <span className="text-[7px] sm:text-[8px] font-mono text-muted-foreground leading-none">{pos.role}</span>
        </div>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-[200px]">
        <p className="font-semibold text-xs">{player.name} #{player.number}</p>
        <p className="text-[10px] text-muted-foreground">{pos.role} • {player.fitness === "fit" ? "✅ Fit" : player.fitness === "doubt" ? "⚠️ Doubtful" : "❌ Out"}</p>
        {player.roleTags.length > 0 && <p className="text-[10px] text-primary">{player.roleTags.join(", ")}</p>}
        {player.pace && <p className="text-[10px]">Pace: {player.pace}</p>}
      </TooltipContent>
    </Tooltip>
  );
};

const PitchVisualization = ({ homeFormation, awayFormation, homeTeam, awayTeam, homePressShape, awayPressShape }: PitchVisualizationProps) => {
  const { isElite } = useUserTier();
  const [showRoles, setShowRoles] = useState(true);
  const [showPressing, setShowPressing] = useState(false);
  const [possession, setPossession] = useState<"in" | "out">("in");

  return (
    <div className="space-y-3">
      {/* Toggles */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setShowRoles(!showRoles)}
          className={cn("text-[10px] font-mono px-2.5 py-1 rounded border transition-colors",
            showRoles ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}
        >
          Show Roles
        </button>
        <button
          onClick={() => setShowPressing(!showPressing)}
          className={cn("text-[10px] font-mono px-2.5 py-1 rounded border transition-colors",
            showPressing ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}
        >
          Press Shape {showPressing && homePressShape ? `(${homePressShape})` : ""}
        </button>
        {isElite && (
          <div className="flex items-center bg-secondary rounded border border-border p-0.5">
            {(["in", "out"] as const).map(mode => (
              <button key={mode} onClick={() => setPossession(mode)}
                className={cn("text-[10px] font-mono px-2 py-0.5 rounded transition-colors",
                  possession === mode ? "bg-primary/20 text-primary" : "text-muted-foreground")}>
                {mode === "in" ? "In Poss." : "Out of Poss."}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pitch */}
      <div className="relative w-full aspect-[68/105] max-w-md mx-auto rounded-xl overflow-hidden border border-border">
        {/* Field background */}
        <div className="absolute inset-0 bg-[hsl(145_40%_12%)]" />

        {/* Field markings */}
        <svg viewBox="0 0 68 105" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid meet">
          {/* Outline */}
          <rect x="1" y="1" width="66" height="103" fill="none" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          {/* Center line */}
          <line x1="1" y1="52.5" x2="67" y2="52.5" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          {/* Center circle */}
          <circle cx="34" cy="52.5" r="9.15" fill="none" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          <circle cx="34" cy="52.5" r="0.5" fill="hsl(145 40% 25%)" />
          {/* Penalty areas */}
          <rect x="13.85" y="1" width="40.3" height="16.5" fill="none" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          <rect x="13.85" y="87.5" width="40.3" height="16.5" fill="none" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          {/* Goal areas */}
          <rect x="24.85" y="1" width="18.3" height="5.5" fill="none" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          <rect x="24.85" y="98.5" width="18.3" height="5.5" fill="none" stroke="hsl(145 40% 25%)" strokeWidth="0.3" />
          {/* Penalty spots */}
          <circle cx="34" cy="12" r="0.4" fill="hsl(145 40% 25%)" />
          <circle cx="34" cy="93" r="0.4" fill="hsl(145 40% 25%)" />
        </svg>

        {/* Team labels */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
          <span className="text-[9px] font-mono text-foreground/60 bg-background/60 px-2 py-0.5 rounded">
            {awayTeam} — {awayFormation.formation}
          </span>
        </div>
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
          <span className="text-[9px] font-mono text-foreground/60 bg-background/60 px-2 py-0.5 rounded">
            {homeTeam} — {homeFormation.formation}
          </span>
        </div>

        {/* Player nodes — home (bottom half) */}
        {homeFormation.positions.map((pos, i) => (
          <PlayerNode key={`home-${i}`} pos={pos} isAway={false} />
        ))}
        {/* Player nodes — away (top half, mirrored) */}
        {awayFormation.positions.map((pos, i) => (
          <PlayerNode key={`away-${i}`} pos={pos} isAway={true} />
        ))}
      </div>
    </div>
  );
};

export default PitchVisualization;
