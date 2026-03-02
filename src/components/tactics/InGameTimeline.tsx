import { useState } from "react";
import { ShapeChangeEvent, players, FormationSnapshot } from "@/lib/tacticsData";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface InGameTimelineProps {
  shapeChanges: ShapeChangeEvent[];
  teamName: string;
  initialFormation: FormationSnapshot;
  onSelectMoment?: (formation: string) => void;
}

const eventIcons: Record<string, string> = {
  goal: "⚽",
  red_card: "🟥",
  substitution: "🔄",
  formation_change: "📐",
};

const InGameTimeline = ({ shapeChanges, teamName, initialFormation, onSelectMoment }: InGameTimelineProps) => {
  const [minute, setMinute] = useState(0);

  // Find the active shape at the current minute
  const activeChange = [...shapeChanges].reverse().find(c => c.minute <= minute);
  const currentFormation = activeChange?.newFormation ?? initialFormation.formation;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-mono font-semibold text-foreground">{teamName} — In-Game Timeline</h4>
        <span className="text-xs font-mono text-primary">{minute}'</span>
      </div>

      {/* Slider */}
      <div className="relative">
        <Slider
          value={[minute]}
          onValueChange={([v]) => setMinute(v)}
          min={0}
          max={90}
          step={1}
          className="w-full"
        />
        {/* Event markers */}
        <div className="relative h-4 mt-1">
          {shapeChanges.map((evt, i) => (
            <button
              key={i}
              onClick={() => setMinute(evt.minute)}
              className="absolute -translate-x-1/2 text-[10px] hover:scale-125 transition-transform"
              style={{ left: `${(evt.minute / 90) * 100}%` }}
              title={evt.label}
            >
              {eventIcons[evt.type]}
            </button>
          ))}
        </div>
      </div>

      {/* Current state */}
      <div className="bg-secondary/50 rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-foreground">Formation: <span className="text-primary">{currentFormation}</span></span>
          <span className="text-[10px] text-muted-foreground">@ {minute}'</span>
        </div>
        {activeChange && (
          <>
            <p className="text-[10px] font-mono text-foreground">{activeChange.label}</p>
            <p className="text-[10px] text-muted-foreground italic">{activeChange.reason}</p>
          </>
        )}
        {!activeChange && (
          <p className="text-[10px] text-muted-foreground">Starting formation — no changes yet</p>
        )}
      </div>

      {/* All events list */}
      <div className="space-y-1.5">
        {shapeChanges.map((evt, i) => (
          <button
            key={i}
            onClick={() => setMinute(evt.minute)}
            className={cn(
              "w-full flex items-center gap-2 px-2 py-1.5 rounded text-left transition-colors",
              minute >= evt.minute ? "bg-primary/10 border border-primary/20" : "bg-secondary/30 border border-transparent hover:border-border"
            )}
          >
            <span className="text-sm">{eventIcons[evt.type]}</span>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-mono text-foreground truncate">{evt.label}</p>
              <p className="text-[9px] text-muted-foreground">{evt.reason}</p>
            </div>
            <span className="text-[10px] font-mono text-primary shrink-0">{evt.minute}'</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InGameTimeline;
