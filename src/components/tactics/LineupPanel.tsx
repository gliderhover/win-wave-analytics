import { FormationSnapshot, players, Player } from "@/lib/tacticsData";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface LineupPanelProps {
  formation: FormationSnapshot;
  bench: string[];
  teamName: string;
}

const fitnessIcon: Record<string, string> = { fit: "🟢", doubt: "🟡", out: "🔴" };

const groupByLine = (formation: FormationSnapshot) => {
  const groups: Record<string, { player: Player; role: string }[]> = { DEF: [], MID: [], ATT: [] };
  formation.positions.forEach(pos => {
    const p = players[pos.playerId];
    if (!p || pos.role === "GK") return;
    const line = ["CB", "LB", "RB", "LWB", "RWB"].includes(pos.role) ? "DEF"
      : ["ST", "CF", "LW", "RW"].includes(pos.role) ? "ATT" : "MID";
    groups[line].push({ player: p, role: pos.role });
  });
  return groups;
};

const LineupPanel = ({ formation, bench, teamName }: LineupPanelProps) => {
  const gk = formation.positions.find(p => p.role === "GK");
  const gkPlayer = gk ? players[gk.playerId] : null;
  const lines = groupByLine(formation);

  return (
    <div className="space-y-2">
      <h4 className="text-xs font-mono font-semibold text-foreground">{teamName} — {formation.formation}</h4>

      {/* GK */}
      {gkPlayer && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{fitnessIcon[gkPlayer.fitness]}</span>
          <span className="font-mono text-foreground">{gkPlayer.shortName}</span>
          <span className="text-[10px] text-primary">GK</span>
        </div>
      )}

      {/* Lines */}
      {(["DEF", "MID", "ATT"] as const).map(line => (
        <div key={line}>
          <div className="text-[10px] font-mono text-muted-foreground mb-1">{line}</div>
          <div className="space-y-0.5">
            {lines[line].map(({ player, role }) => (
              <div key={player.id} className="flex items-center gap-2 text-xs">
                <span className="text-[10px]">{fitnessIcon[player.fitness]}</span>
                <span className={cn("font-mono", player.fitness === "out" ? "text-muted-foreground line-through" : "text-foreground")}>
                  {player.shortName}
                </span>
                <span className="text-[10px] text-primary">{role}</span>
                {player.fitness === "doubt" && <span className="text-[9px] text-warning">Doubtful</span>}
                {player.fitness === "out" && <span className="text-[9px] text-destructive">Out</span>}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bench */}
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="bench" className="border-border/50">
          <AccordionTrigger className="text-[10px] font-mono text-muted-foreground py-2 hover:no-underline">
            Bench ({bench.length})
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-0.5">
              {bench.map(pid => {
                const p = players[pid];
                if (!p) return null;
                return (
                  <div key={pid} className="flex items-center gap-2 text-xs">
                    <span className="text-[10px]">{fitnessIcon[p.fitness]}</span>
                    <span className="font-mono text-muted-foreground">{p.shortName}</span>
                    <span className="text-[10px] text-muted-foreground">{p.primaryPosition}</span>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default LineupPanel;
