import { cn } from "@/lib/utils";
import { Crown, Shield, Target, Activity, AlertTriangle, Clock, Footprints } from "lucide-react";
import {
  type EliteTeam, type ElitePlayer, type EliteCoach,
} from "@/lib/eliteData";
import {
  teamProfiles, playerProfiles, coachProfiles,
  type TeamProfile, type PlayerProfile, type CoachProfile,
} from "@/lib/eliteProfileData";

// ─── Shared ─────────────────────────────────────────────────────
const Stat = ({ label, value, color }: { label: string; value: string | number; color?: string }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground">{label}</span>
    <span className={cn("font-mono font-medium", color || "text-foreground")}>{value}</span>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 mt-4 first:mt-0">{children}</h4>
);

const BarScore = ({ label, value }: { label: string; value: number }) => (
  <div className="space-y-0.5">
    <div className="flex justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{value}</span>
    </div>
    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
      <div className="h-full rounded-full bg-primary/70" style={{ width: `${value}%` }} />
    </div>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => (
  <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded",
    status === "Fit" ? "bg-signal-bullish/10 text-signal-bullish" :
    status === "Doubtful" ? "bg-signal-neutral/10 text-signal-neutral" :
    "bg-signal-bearish/10 text-signal-bearish"
  )}>{status}</span>
);

// ─── Team Panel ─────────────────────────────────────────────────
export const TeamInfoPanel = ({ entity }: { entity: EliteTeam }) => {
  const profile = teamProfiles[entity.id];
  if (!profile) return <div className="text-xs text-muted-foreground">No extended profile available</div>;
  const p = profile.performance_4y;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" /> Team Profile
        </h3>
        <span className="text-[10px] text-muted-foreground">Updated {entity.last_updated}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">Data coverage: International matches (last 4 years)</p>

      <SectionTitle>Basics</SectionTitle>
      <Stat label="Team" value={`${entity.flag} ${entity.name}`} />
      <Stat label="Competition" value={entity.league_name} />
      <Stat label="Head Coach" value={`${profile.coach_name} (${profile.coach_nationality})`} />

      <SectionTitle>Squad Snapshot</SectionTitle>
      <div className="space-y-1.5">
        {profile.key_players.map(kp => (
          <div key={kp.name} className="flex items-center justify-between text-xs">
            <span className="text-foreground">{kp.name} <span className="text-muted-foreground text-[10px]">({kp.position})</span></span>
            <span className="font-mono text-primary">{kp.rating}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 space-y-1">
        <Stat label="Avg Age" value={profile.squad_avg_age} />
        <Stat label="Rotation Depth" value={`${profile.rotation_depth}/100`} />
      </div>

      <SectionTitle>Performance (4Y)</SectionTitle>
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Win</div>
          <div className="font-mono text-sm font-bold text-signal-bullish">{p.win_rate}%</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Draw</div>
          <div className="font-mono text-sm font-bold text-signal-neutral">{p.draw_rate}%</div>
        </div>
        <div className="bg-secondary/50 rounded-lg p-2 text-center">
          <div className="text-[10px] text-muted-foreground">Loss</div>
          <div className="font-mono text-sm font-bold text-signal-bearish">{p.loss_rate}%</div>
        </div>
      </div>
      <Stat label="Goals For / Game" value={p.gf_pg.toFixed(1)} />
      <Stat label="Goals Against / Game" value={p.ga_pg.toFixed(1)} />
      <Stat label="Clean Sheet Rate" value={`${p.cs_rate}%`} />
      <Stat label="BTTS Rate" value={`${p.btts_rate}%`} />
      <Stat label="Home Win Rate" value={`${p.home_win}%`} />
      <Stat label="Away Win Rate" value={`${p.away_win}%`} />

      <SectionTitle>Style Indicators</SectionTitle>
      <div className="space-y-2">
        <BarScore label="Press Intensity" value={profile.press_intensity} />
        <BarScore label="Possession Bias" value={profile.possession_bias} />
        <BarScore label="Transition Speed" value={profile.transition_speed} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="text-[10px] font-mono px-2 py-1 rounded border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
          Open Due Diligence
        </button>
        <button className="text-[10px] font-mono px-2 py-1 rounded border border-border bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
          Open Tactics & Formation
        </button>
      </div>
    </div>
  );
};

// ─── Player Panel ───────────────────────────────────────────────
export const PlayerInfoPanel = ({ entity }: { entity: ElitePlayer }) => {
  const profile = playerProfiles[entity.id];
  if (!profile) return <div className="text-xs text-muted-foreground">No extended profile available</div>;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" /> Player Profile
        </h3>
        <span className="text-[10px] text-muted-foreground">Updated {entity.last_updated}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">Data coverage: Last 2 seasons + career</p>

      <SectionTitle>Basics</SectionTitle>
      <Stat label="Name" value={`${entity.flag} ${entity.name}`} />
      <Stat label="Club" value={entity.club} />
      <Stat label="Position" value={entity.position} />
      <Stat label="Age" value={profile.age} />
      <Stat label="Foot" value={profile.preferred_foot} />
      <Stat label="Height" value={profile.height} />

      <SectionTitle>Production</SectionTitle>
      <Stat label="Career Goals" value={profile.goals_total} />
      <Stat label="Career Assists" value={profile.assists_total} />
      <Stat label="Goals/Game (recent)" value={profile.goals_per_game_recent.toFixed(2)} />
      <Stat label="Minutes/Match" value={profile.minutes_per_match} />
      <Stat label="Shots/90" value={profile.shots_per_90.toFixed(1)} />
      <Stat label="xG Proxy" value={profile.xg_proxy.toFixed(2)} />

      <SectionTitle>Availability & Risk</SectionTitle>
      <div className="flex items-center gap-2 text-xs mb-1">
        <span className="text-muted-foreground">Status:</span>
        <StatusBadge status={profile.injury_status} />
      </div>
      <Stat label="Last Injury" value={profile.last_injury} />
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground">Fatigue:</span>
        <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded",
          entity.fatigue === "low" ? "bg-signal-bullish/10 text-signal-bullish" :
          entity.fatigue === "medium" ? "bg-signal-neutral/10 text-signal-neutral" :
          "bg-signal-bearish/10 text-signal-bearish"
        )}>{entity.fatigue}</span>
      </div>
      <Stat label="Card Rate (Y/90)" value={profile.card_rate.toFixed(2)} />

      <SectionTitle>Form (Last 5)</SectionTitle>
      <div className="space-y-1">
        {profile.last5.map((m, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{m.match}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono">{m.contribution}</span>
              <span className={cn("font-mono text-[10px] px-1 rounded",
                m.rating >= 8 ? "text-signal-bullish" : m.rating >= 7 ? "text-foreground" : "text-signal-neutral"
              )}>{m.rating}</span>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Tactical Fit</SectionTitle>
      <div className="flex flex-wrap gap-1 mb-1">
        {profile.role_tags.map(tag => (
          <span key={tag} className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">{tag}</span>
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Best in: {profile.best_used_in.join(", ")}
      </div>
    </div>
  );
};

// ─── Coach Panel ────────────────────────────────────────────────
export const CoachInfoPanel = ({ entity }: { entity: EliteCoach }) => {
  const profile = coachProfiles[entity.id];
  if (!profile) return <div className="text-xs text-muted-foreground">No extended profile available</div>;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Footprints className="w-4 h-4 text-primary" /> Coach Profile
        </h3>
        <span className="text-[10px] text-muted-foreground">Updated {entity.last_updated}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">Data coverage: Last 4 seasons</p>

      <SectionTitle>Basics</SectionTitle>
      <Stat label="Name" value={`${entity.flag} ${entity.name}`} />
      <Stat label="Team" value={entity.team} />
      <Stat label="Competition" value={entity.league_name} />
      <Stat label="Age" value={profile.age} />
      <Stat label="Tenure Since" value={profile.tenure_start} />

      <SectionTitle>Tactical Preferences</SectionTitle>
      <div className="space-y-1.5 mb-2">
        {profile.formations_usage.map(f => (
          <div key={f.formation} className="flex items-center gap-2">
            <span className="text-xs text-foreground w-20">{f.formation}</span>
            <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-primary/70" style={{ width: `${f.pct}%` }} />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{f.pct}%</span>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <BarScore label="Possession Score" value={profile.possession_score} />
        <BarScore label="Directness" value={profile.directness_score} />
        <BarScore label="Press Intensity" value={profile.press_intensity} />
        <BarScore label="Rotation Rate" value={profile.rotation_rate} />
      </div>

      <SectionTitle>Game-State Behavior</SectionTitle>
      <Stat label="When Leading" value={profile.when_leading} />
      <Stat label="When Trailing" value={profile.when_trailing} />
      <Stat label="Sub Timing" value={profile.sub_timing} />
      <BarScore label="Sub Aggressiveness" value={profile.sub_aggressiveness} />

      <SectionTitle>Performance (4Y)</SectionTitle>
      <Stat label="Win Rate" value={`${profile.performance_4y.win_rate}%`} />
      <Stat label="Points/Game" value={profile.performance_4y.ppg.toFixed(2)} />
      <Stat label="Big Match Win %" value={`${profile.performance_4y.big_match_pct}%`} />

      {profile.risk_flags.length > 0 && (
        <>
          <SectionTitle>Risk Flags</SectionTitle>
          <div className="space-y-1">
            {profile.risk_flags.map((flag, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <AlertTriangle className="w-3 h-3 text-signal-neutral flex-shrink-0" />
                <span className="text-secondary-foreground">{flag}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// ─── Compare Summary ────────────────────────────────────────────
export const CompareSummary = ({ entityA, entityB, axes }: { entityA: any; entityB: any; axes: string[] }) => {
  const scoresA = entityA.radar_scores as Record<string, number>;
  const scoresB = entityB.radar_scores as Record<string, number>;

  const deltas = axes.map(axis => ({
    axis,
    diff: (scoresA[axis] ?? 0) - (scoresB[axis] ?? 0),
  })).sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff));

  const top3 = deltas.slice(0, 3);

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" /> Compare Summary
      </h3>

      <SectionTitle>Top Radar Differences</SectionTitle>
      <div className="space-y-2">
        {top3.map(d => (
          <div key={d.axis} className="space-y-0.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{d.axis}</span>
              <span className={cn("font-mono font-medium",
                d.diff > 0 ? "text-primary" : d.diff < 0 ? "text-accent" : "text-foreground"
              )}>
                {d.diff > 0 ? "+" : ""}{d.diff}
              </span>
            </div>
            <div className="flex gap-1 h-1.5">
              <div className="flex-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-primary/70" style={{ width: `${scoresA[d.axis] ?? 0}%` }} />
              </div>
              <div className="flex-1 bg-secondary rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-accent/70" style={{ width: `${scoresB[d.axis] ?? 0}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionTitle>Implications</SectionTitle>
      <div className="space-y-1">
        {top3.map(d => {
          const winner = d.diff > 0 ? entityA.name : entityB.name;
          return (
            <div key={d.axis} className="text-xs text-secondary-foreground">
              • {winner} stronger in {d.axis} ({d.diff > 0 ? "+" : ""}{d.diff})
            </div>
          );
        })}
      </div>
    </div>
  );
};
