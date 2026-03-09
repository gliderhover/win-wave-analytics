import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";
import {
  Crown,
  Search,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Users,
  User,
  Briefcase,
  Filter,
  ArrowRightLeft,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Activity,
  Target,
  Heart,
  Brain,
  Eye,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  eliteTeams,
  elitePlayers,
  eliteCoaches,
  teamRadarAxes,
  playerRadarAxes,
  coachRadarAxes,
  ddReportSections,
  riskFlags,
  mockSources,
  type EliteTeam,
  type ElitePlayer,
  type EliteCoach,
} from "@/lib/eliteData";
import {
  teamProfiles,
  playerProfiles,
  coachProfiles,
} from "@/lib/eliteProfileData";
import { ALLOWED_LEAGUES } from "@/constants/allowedLeagues";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
} from "recharts";

type EntityType = "team" | "player" | "coach";

const getEntities = (type: EntityType) => {
  if (type === "team")
    return eliteTeams.map((t) => ({ id: t.id, name: t.name, flag: t.flag, sub: t.country, league: t.league_name }));
  if (type === "player")
    return elitePlayers.map((p) => ({ id: p.id, name: p.name, flag: p.flag, sub: `${p.position} — ${p.club}`, league: p.league_name }));
  return eliteCoaches.map((c) => ({ id: c.id, name: c.name, flag: c.flag, sub: c.team, league: c.league_name }));
};

const getEntity = (type: EntityType, id: string) => {
  if (type === "team") return eliteTeams.find((t) => t.id === id);
  if (type === "player") return elitePlayers.find((p) => p.id === id);
  return eliteCoaches.find((c) => c.id === id);
};

const getRadarAxes = (type: EntityType) => {
  if (type === "team") return teamRadarAxes;
  if (type === "player") return playerRadarAxes;
  return coachRadarAxes;
};

const getEntityName = (type: EntityType, entity: EliteTeam | ElitePlayer | EliteCoach) => {
  return (entity as { name: string }).name;
};

const EliteBadge = () => (
  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 ml-1">
    ELITE
  </span>
);

const SignalGauge = ({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Activity }) => {
  const color = value >= 80 ? "text-signal-bullish" : value >= 60 ? "text-primary" : "text-signal-bearish";
  const bg = value >= 80 ? "bg-signal-bullish" : value >= 60 ? "bg-primary" : "bg-signal-bearish";
  return (
    <div className="relative group">
      <div className="bg-secondary/60 rounded-xl p-3 border border-border/50 hover:border-primary/30 transition-all">
        <div className="flex items-center gap-1.5 mb-2">
          <Icon className={cn("w-3 h-3", color)} />
          <span className="text-[10px] text-muted-foreground capitalize">{label}</span>
        </div>
        <div className={cn("font-mono text-xl font-bold", color)}>{value}</div>
        <div className="h-1 bg-secondary rounded-full mt-2 overflow-hidden">
          <div className={cn("h-full rounded-full transition-all", bg)} style={{ width: `${value}%` }} />
        </div>
      </div>
    </div>
  );
};

const signalIcons: Record<string, typeof Activity> = {
  form: TrendingUp,
  fitness: Heart,
  cohesion: Users,
  tactics: Brain,
  mental: Zap,
  market_respect: Target,
};

// ─── Digital Twin Tab ──────────────────────────────────────────────────────
const DigitalTwinTab = () => {
  const [entityType, setEntityType] = useState<EntityType>("team");
  const [selectedId, setSelectedId] = useState("t1");
  const [search, setSearch] = useState("");

  const entities = useMemo(() => {
    const all = getEntities(entityType);
    if (!search) return all;
    return all.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));
  }, [entityType, search]);

  const entity = getEntity(entityType, selectedId);

  const handleTypeChange = (t: EntityType) => {
    setEntityType(t);
    const first = getEntities(t)[0];
    if (first) setSelectedId(first.id);
    setSearch("");
  };

  const signals = entity && "signals" in entity ? (entity as EliteTeam).signals : null;
  const timeline = entity && "timeline" in entity ? ((entity as EliteTeam).timeline ?? []) : [];
  const twinStatus = entity && "twin_status" in entity ? (entity as EliteTeam).twin_status : "limited";

  // Extended profile data
  const teamProfile = entityType === "team" ? teamProfiles[selectedId] : null;
  const playerProfile = entityType === "player" ? playerProfiles[selectedId] : null;
  const coachProfile = entityType === "coach" ? coachProfiles[selectedId] : null;

  return (
    <div className="space-y-6">
      {/* Top bar: entity type + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex gap-1 bg-secondary/60 rounded-xl border border-border p-1">
          {([["team", Users, "Teams"], ["player", User, "Players"], ["coach", Briefcase, "Coaches"]] as [EntityType, typeof Users, string][]).map(
            ([t, Icon, label]) => (
              <button
                key={t}
                onClick={() => handleTypeChange(t)}
                className={cn(
                  "text-xs font-mono py-2 px-4 rounded-lg flex items-center gap-1.5 transition-all",
                  entityType === t
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_12px_hsl(175_85%_50%/0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            )
          )}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${entityType}s…`}
            className="pl-9 h-9 text-xs bg-secondary/60 border-border"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left — Entity Selector */}
        <div className="gradient-card rounded-xl border border-border p-4">
          <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-wider">
            Select {entityType}
          </div>
          <div className="space-y-1 max-h-[400px] overflow-y-auto">
            {entities.map((e) => (
              <button
                key={e.id}
                onClick={() => setSelectedId(e.id)}
                className={cn(
                  "w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all",
                  selectedId === e.id
                    ? "bg-primary/10 text-foreground border border-primary/20 shadow-[0_0_10px_hsl(175_85%_50%/0.08)]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{e.flag}</span>
                  <div>
                    <div className="font-medium">{e.name}</div>
                    <div className="text-[10px] text-muted-foreground">{e.sub}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Middle — Digital Twin Profile Card */}
        <div className="lg:col-span-2 space-y-4">
          {entity ? (
            <>
              {/* Hero card */}
              <div className="gradient-card rounded-xl border border-primary/20 p-6 shadow-[0_0_30px_hsl(175_85%_50%/0.08)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[radial-gradient(circle,hsl(175_85%_50%/0.06),transparent_70%)]" />
                <div className="flex items-start gap-4 relative">
                  <div className="w-16 h-16 rounded-2xl bg-secondary/80 flex items-center justify-center text-3xl border border-border">
                    {(entity as { flag?: string }).flag ?? "⚽"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-foreground">{getEntityName(entityType, entity as EliteTeam)}</h3>
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="outline" className={cn(
                        "text-[10px] font-mono",
                        twinStatus === "up-to-date" ? "border-signal-bullish/30 text-signal-bullish" :
                        twinStatus === "updating" ? "border-signal-neutral/30 text-signal-neutral" :
                        "border-border text-muted-foreground"
                      )}>
                        {twinStatus === "up-to-date" ? "✓ Synced" : twinStatus === "updating" ? "⟳ Updating" : "◌ Limited"}
                      </Badge>
                      {"league_name" in entity && (
                        <Badge variant="outline" className="text-[10px] font-mono border-primary/20 text-primary/80">
                          {(entity as EliteTeam).league_name}
                        </Badge>
                      )}
                    </div>

                    {/* Quick stats row */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      {"form_trend" in entity && (
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Form (Last 5)</div>
                          <div className="font-mono flex gap-1">
                            {(entity as EliteTeam).form_trend.map((f, i) => (
                              <span key={i} className={cn(
                                "w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold",
                                f === "W" ? "bg-signal-bullish/20 text-signal-bullish" :
                                f === "D" ? "bg-signal-neutral/20 text-signal-neutral" :
                                f === "L" ? "bg-signal-bearish/20 text-signal-bearish" :
                                "bg-secondary text-foreground"
                              )}>{f}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {"tactical_style" in entity && (
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Style</div>
                          <div className="text-foreground font-medium">{(entity as EliteTeam).tactical_style}</div>
                        </div>
                      )}
                      {"position" in entity && (
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Position</div>
                          <div className="text-foreground font-medium">{(entity as ElitePlayer).position}</div>
                        </div>
                      )}
                      {"formation_preference" in entity && (
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Formation</div>
                          <div className="text-foreground font-medium">{(entity as EliteCoach).formation_preference}</div>
                        </div>
                      )}
                      {"minutes_played" in entity && (
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Minutes</div>
                          <div className="font-mono text-foreground">{(entity as ElitePlayer).minutes_played}'</div>
                        </div>
                      )}
                      {"injury_impact" in entity && (
                        <div>
                          <div className="text-[10px] text-muted-foreground mb-0.5">Injury Impact</div>
                          <div className="font-mono text-foreground">{(entity as EliteTeam).injury_impact}/100</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Signals grid */}
              {signals && (
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2 tracking-wider">Twin Signals</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {Object.entries(signals).map(([key, value]) => (
                      <SignalGauge
                        key={key}
                        label={key.replace("_", " ")}
                        value={value}
                        icon={signalIcons[key] ?? Activity}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Extended profile data */}
              {teamProfile && (
                <div className="gradient-card rounded-xl border border-border p-5 space-y-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Performance Profile</div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "Win%", value: `${teamProfile.performance_4y.win_rate}%`, color: "text-signal-bullish" },
                      { label: "Draw%", value: `${teamProfile.performance_4y.draw_rate}%`, color: "text-muted-foreground" },
                      { label: "Loss%", value: `${teamProfile.performance_4y.loss_rate}%`, color: "text-signal-bearish" },
                      { label: "GF/G", value: `${teamProfile.performance_4y.gf_pg}`, color: "text-foreground" },
                      { label: "GA/G", value: `${teamProfile.performance_4y.ga_pg}`, color: "text-foreground" },
                      { label: "CS%", value: `${teamProfile.performance_4y.cs_rate}%`, color: "text-foreground" },
                    ].map((s) => (
                      <div key={s.label} className="text-center bg-secondary/40 rounded-lg p-2">
                        <div className="text-[9px] text-muted-foreground mb-1">{s.label}</div>
                        <div className={cn("font-mono text-sm font-bold", s.color)}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Press Intensity</span>
                        <span className="font-mono text-foreground">{teamProfile.press_intensity}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${teamProfile.press_intensity}%` }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[10px] mb-1">
                        <span className="text-muted-foreground">Possession Bias</span>
                        <span className="font-mono text-foreground">{teamProfile.possession_bias}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${teamProfile.possession_bias}%` }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {playerProfile && (
                <div className="gradient-card rounded-xl border border-border p-5 space-y-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Player Profile</div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Goals", value: playerProfile.goals_total },
                      { label: "Assists", value: playerProfile.assists_total },
                      { label: "G/Game", value: playerProfile.goals_per_game_recent.toFixed(2) },
                      { label: "xG Proxy", value: playerProfile.xg_proxy.toFixed(2) },
                      { label: "Shots/90", value: playerProfile.shots_per_90 },
                      { label: "Min/Match", value: playerProfile.minutes_per_match },
                      { label: "Cards/90", value: playerProfile.card_rate },
                      { label: "Status", value: playerProfile.injury_status },
                    ].map((s) => (
                      <div key={s.label} className="text-center bg-secondary/40 rounded-lg p-2">
                        <div className="text-[9px] text-muted-foreground mb-1">{s.label}</div>
                        <div className="font-mono text-sm font-bold text-foreground">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-2">Last 5 Matches</div>
                    <div className="space-y-1">
                      {playerProfile.last5.map((m, i) => (
                        <div key={i} className="flex items-center justify-between text-xs bg-secondary/30 rounded-lg px-3 py-1.5">
                          <span className="text-muted-foreground">{m.match}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-foreground">{m.contribution}</span>
                            <span className="font-mono text-primary">{m.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {playerProfile.role_tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px] border-primary/20 text-primary/80">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {coachProfile && (
                <div className="gradient-card rounded-xl border border-border p-5 space-y-4">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">Coach Profile</div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Win Rate", value: `${coachProfile.performance_4y.win_rate}%` },
                      { label: "PPG", value: coachProfile.performance_4y.ppg.toFixed(2) },
                      { label: "Big Match%", value: `${coachProfile.performance_4y.big_match_pct}%` },
                    ].map((s) => (
                      <div key={s.label} className="text-center bg-secondary/40 rounded-lg p-2">
                        <div className="text-[9px] text-muted-foreground mb-1">{s.label}</div>
                        <div className="font-mono text-sm font-bold text-foreground">{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="text-[10px] text-muted-foreground mb-2">Formation Usage</div>
                    <div className="space-y-1.5">
                      {coachProfile.formations_usage.map((f) => (
                        <div key={f.formation} className="flex items-center gap-2">
                          <span className="text-xs text-foreground w-20">{f.formation}</span>
                          <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${f.pct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">{f.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-[10px] text-signal-bullish mb-1 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> When Leading</div>
                      <div className="text-muted-foreground">{coachProfile.when_leading}</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-3">
                      <div className="text-[10px] text-signal-bearish mb-1 flex items-center gap-1"><TrendingDown className="w-3 h-3" /> When Trailing</div>
                      <div className="text-muted-foreground">{coachProfile.when_trailing}</div>
                    </div>
                  </div>
                  {coachProfile.risk_flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {coachProfile.risk_flags.map((flag) => (
                        <Badge key={flag} variant="outline" className="text-[10px] border-signal-bearish/30 text-signal-bearish">{flag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="gradient-card rounded-xl border border-border p-12 text-center">
              <Eye className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Select an entity to view its Digital Twin</p>
            </div>
          )}
        </div>

        {/* Right — Timeline */}
        <div className="gradient-card rounded-xl border border-border p-5">
          <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-wider">Activity Timeline</div>
          <div className="space-y-3">
            {timeline.length > 0 ? (
              timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full flex-shrink-0",
                      ev.type === "positive" ? "bg-signal-bullish" : ev.type === "negative" ? "bg-signal-bearish" : "bg-signal-neutral"
                    )} />
                    {i < timeline.length - 1 && <div className="w-px h-8 bg-border mt-1" />}
                  </div>
                  <div className="pb-2">
                    <div className="text-xs text-foreground leading-tight">{ev.event}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{ev.date}</div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recent events</p>
            )}
          </div>

          {/* News for teams */}
          {entity && "news" in entity && (entity as EliteTeam).news.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-wider">Latest News</div>
              <div className="space-y-2">
                {(entity as EliteTeam).news.map((n, i) => (
                  <div key={i} className="bg-secondary/30 rounded-lg p-2.5">
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                        n.sentiment === "positive" ? "bg-signal-bullish" : n.sentiment === "negative" ? "bg-signal-bearish" : "bg-signal-neutral"
                      )} />
                      <div>
                        <div className="text-xs text-foreground">{n.headline}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5">{n.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Injuries for teams */}
          {entity && "injuries" in entity && (entity as EliteTeam).injuries.length > 0 && (
            <div className="mt-6 pt-4 border-t border-border">
              <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-wider">Injury Report</div>
              <div className="space-y-2">
                {(entity as EliteTeam).injuries.map((inj, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-secondary/30 rounded-lg px-3 py-2">
                    <span className="text-foreground">{inj.player}</span>
                    <Badge variant="outline" className={cn(
                      "text-[9px]",
                      inj.severity === "major" ? "border-signal-bearish/30 text-signal-bearish" :
                      inj.severity === "moderate" ? "border-signal-neutral/30 text-signal-neutral" :
                      "border-signal-bullish/30 text-signal-bullish"
                    )}>{inj.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Due Diligence Tab ─────────────────────────────────────────────────────
const DDSection = ({ section }: { section: (typeof ddReportSections)[0] }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="gradient-card rounded-xl border border-border p-4">
      <button onClick={() => setOpen(!open)} className="flex items-center justify-between w-full text-left">
        <div>
          <h4 className="text-sm font-semibold text-foreground">{section.title}</h4>
          <p className="text-xs text-muted-foreground mt-0.5">{section.summary}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>
      {open && (
        <ul className="mt-3 space-y-1.5 pl-3 border-l border-border">
          {section.details.map((d, i) => (
            <li key={i} className="text-xs text-secondary-foreground">{d}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DueDiligenceTab = () => (
  <div className="space-y-4">
    {ddReportSections.map((s) => <DDSection key={s.title} section={s} />)}
    <div className="gradient-card rounded-xl border border-primary/30 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Risk Flags</h4>
        <EliteBadge />
      </div>
      <div className="space-y-2">
        {riskFlags.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0", f.level === "red" ? "bg-signal-bearish" : f.level === "amber" ? "bg-signal-neutral" : "bg-signal-bullish")} />
            <span className="text-xs text-secondary-foreground">{f.text}</span>
          </div>
        ))}
      </div>
    </div>
    <div className="gradient-card rounded-xl border border-border p-5">
      <h4 className="text-sm font-semibold text-foreground mb-3">Sources</h4>
      <div className="flex flex-wrap gap-2">
        {mockSources.map((s, i) => (
          <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
            <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded", s.type === "News" ? "bg-primary/10 text-primary" : s.type === "Injury report" ? "bg-signal-bearish/10 text-signal-bearish" : "bg-signal-neutral/10 text-signal-neutral")}>{s.type}</span>
            <span className="text-xs text-secondary-foreground">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── Radar Analytics Tab ────────────────────────────────────────────────────
const FilterSelect = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div className="space-y-1">
    <label className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-2.5 py-2 text-xs text-foreground focus:border-primary/40 focus:ring-1 focus:ring-primary/20 outline-none transition-colors">
      {options.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const RadarAnalyticsTab = () => {
  const [entityType, setEntityType] = useState<EntityType>("team");
  const [compare, setCompare] = useState(false);
  const [entityAId, setEntityAId] = useState("t1");
  const [entityBId, setEntityBId] = useState("t2");
  const [competitionFilter, setCompetitionFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");

  const competitionOptions = useMemo(
    () => [
      { value: "all", label: "All Leagues" },
      ...ALLOWED_LEAGUES.map((l) => ({ value: String(l.id), label: l.name })),
    ],
    []
  );

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    eliteTeams.forEach((t) => set.add(t.country));
    elitePlayers.forEach((p) => set.add(p.country));
    eliteCoaches.forEach((c) => set.add(c.country));
    return Array.from(set).sort();
  }, []);

  const filteredEntities = useMemo(() => {
    let items = getEntities(entityType);
    if (competitionFilter !== "all") {
      items = items.filter((e) => {
        const ent = getEntity(entityType, e.id);
        return ent && "league_id" in ent && (ent as EliteTeam).league_id === competitionFilter;
      });
    }
    if (countryFilter !== "all") items = items.filter((e) => e.sub.includes(countryFilter));
    return items;
  }, [entityType, competitionFilter, countryFilter]);

  const axes = getRadarAxes(entityType);
  const entityA = getEntity(entityType, entityAId);
  const entityB = compare ? getEntity(entityType, entityBId) : null;

  const radarScoresA = entityA && "radar_scores" in entityA ? (entityA as EliteTeam).radar_scores : null;
  const radarScoresB = entityB && "radar_scores" in entityB ? (entityB as EliteTeam).radar_scores : null;

  const axisData = axes.map((axis) => ({
    axis,
    A: radarScoresA ? radarScoresA[axis] ?? 0 : 0,
    ...(compare && radarScoresB ? { B: radarScoresB[axis] ?? 0 } : {}),
  }));

  const entityOptions = filteredEntities.map((e) => ({ value: e.id, label: `${e.flag} ${e.name}` }));

  useEffect(() => {
    const first = filteredEntities[0];
    if (first && !getEntity(entityType, entityAId)) setEntityAId(first.id);
  }, [entityType, filteredEntities]);

  // Comparison differences
  const topDifferences = useMemo(() => {
    if (!compare || !radarScoresA || !radarScoresB) return [];
    return axes
      .map((axis) => ({
        axis,
        a: radarScoresA[axis] ?? 0,
        b: radarScoresB[axis] ?? 0,
        diff: (radarScoresA[axis] ?? 0) - (radarScoresB[axis] ?? 0),
      }))
      .sort((x, y) => Math.abs(y.diff) - Math.abs(x.diff))
      .slice(0, 3);
  }, [compare, radarScoresA, radarScoresB, axes]);

  // Info panel for non-compare mode
  const selectedTeam = entityType === "team" ? eliteTeams.find((t) => t.id === entityAId) : null;
  const selectedPlayer = entityType === "player" ? elitePlayers.find((p) => p.id === entityAId) : null;
  const selectedCoach = entityType === "coach" ? eliteCoaches.find((c) => c.id === entityAId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters */}
      <div className="gradient-card rounded-xl border border-border p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          <EliteBadge />
        </div>

        <FilterSelect label="Entity" value={entityType} onChange={(v) => { setEntityType(v as EntityType); const first = getEntities(v as EntityType)[0]; if (first) { setEntityAId(first.id); setEntityBId(getEntities(v as EntityType)[1]?.id ?? first.id); } }} options={[{ value: "team", label: "Team" }, { value: "player", label: "Player" }, { value: "coach", label: "Coach" }]} />

        {/* Compare toggle */}
        <div className="bg-secondary/60 rounded-lg p-3 border border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-medium text-foreground">Compare Mode</span>
            </div>
            <Switch checked={compare} onCheckedChange={setCompare} />
          </div>
          {compare && (
            <p className="text-[10px] text-muted-foreground mt-2">Select two entities to compare radar profiles side by side.</p>
          )}
        </div>

        <FilterSelect label="Competition" value={competitionFilter} onChange={setCompetitionFilter} options={competitionOptions} />
        <FilterSelect label="Country" value={countryFilter} onChange={(v) => setCountryFilter(v)} options={[{ value: "all", label: "All Countries" }, ...availableCountries.map((c) => ({ value: c, label: c }))]} />

        <div className="border-t border-border pt-3 space-y-3">
          <FilterSelect
            label={compare ? "ENTITY A" : `SELECT ${entityType.toUpperCase()}`}
            value={entityAId}
            onChange={setEntityAId}
            options={entityOptions.length > 0 ? entityOptions : [{ value: "t1", label: "🇧🇷 Brazil" }]}
          />
          {compare && (
            <FilterSelect
              label="ENTITY B"
              value={entityBId}
              onChange={setEntityBId}
              options={entityOptions.filter((o) => o.value !== entityAId).length > 0
                ? entityOptions.filter((o) => o.value !== entityAId)
                : entityOptions}
            />
          )}
        </div>
      </div>

      {/* Octagon Radar */}
      <div className={cn("gradient-card rounded-xl border border-border p-5", compare ? "lg:col-span-3" : "lg:col-span-2")}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            Octagon Radar <EliteBadge />
          </h3>
          {compare && entityA && entityB && (
            <div className="flex items-center gap-3 text-[10px]">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="text-foreground font-medium">{getEntityName(entityType, entityA as EliteTeam)}</span>
              </div>
              <span className="text-muted-foreground">vs</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[hsl(24_95%_53%)]" />
                <span className="text-foreground font-medium">{getEntityName(entityType, entityB as EliteTeam)}</span>
              </div>
            </div>
          )}
        </div>

        <div className={cn("mb-4", compare ? "h-80" : "h-64")}>
          {entityA ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={axisData}>
                <PolarGrid stroke="hsl(215 16% 27%)" />
                <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "hsl(215 20% 55%)", fontSize: 9 }} />
                <Radar
                  name={getEntityName(entityType, entityA as EliteTeam)}
                  dataKey="A"
                  stroke="hsl(175 85% 50%)"
                  fill="hsl(175 85% 50% / 0.2)"
                  fillOpacity={0.5}
                  strokeWidth={2}
                />
                {compare && entityB && (
                  <Radar
                    name={getEntityName(entityType, entityB as EliteTeam)}
                    dataKey="B"
                    stroke="hsl(24 95% 53%)"
                    fill="hsl(24 95% 53% / 0.15)"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                )}
                <Legend wrapperStyle={{ fontSize: 11, color: "hsl(215 20% 65%)" }} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">Select an entity</div>
          )}
        </div>

        {/* Score Breakdown */}
        {entityA && radarScoresA && (
          <div className="border-t border-border pt-4">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-wider">Score Breakdown</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {axes.map((ax) => {
                const scoreA = radarScoresA[ax] ?? 0;
                const scoreB = compare && radarScoresB ? radarScoresB[ax] ?? 0 : null;
                const diff = scoreB !== null ? scoreA - scoreB : null;
                return (
                  <div key={ax} className="bg-secondary/40 rounded-lg p-2">
                    <div className="text-[9px] text-muted-foreground mb-1 truncate">{ax}</div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-mono text-sm font-bold text-primary">{scoreA}</span>
                      {compare && scoreB !== null && (
                        <>
                          <span className="text-[9px] text-muted-foreground">vs</span>
                          <span className="font-mono text-sm font-bold text-[hsl(24_95%_53%)]">{scoreB}</span>
                          {diff !== null && diff !== 0 && (
                            <span className={cn("text-[9px] font-mono", diff > 0 ? "text-signal-bullish" : "text-signal-bearish")}>
                              {diff > 0 ? "+" : ""}{diff}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Comparison Summary */}
        {compare && topDifferences.length > 0 && (
          <div className="border-t border-border pt-4 mt-4">
            <div className="text-[10px] font-mono uppercase text-muted-foreground mb-3 tracking-wider flex items-center gap-1.5">
              <ArrowRightLeft className="w-3 h-3" /> Top 3 Differences
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topDifferences.map((d) => {
                const winner = d.diff > 0 ? getEntityName(entityType, entityA as EliteTeam) : getEntityName(entityType, entityB as EliteTeam);
                return (
                  <div key={d.axis} className="bg-secondary/40 rounded-xl p-3 border border-border/50">
                    <div className="text-[10px] text-muted-foreground mb-1">{d.axis}</div>
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span className={cn("font-mono text-lg font-bold", d.diff > 0 ? "text-primary" : "text-[hsl(24_95%_53%)]")}>
                        {d.diff > 0 ? "+" : ""}{d.diff}
                      </span>
                      <span className="text-[10px] text-muted-foreground">pts</span>
                    </div>
                    <div className="text-[10px] text-foreground">
                      <span className="font-medium">{winner}</span>
                      <span className="text-muted-foreground"> leads</span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${d.a}%` }} />
                        </div>
                        <div className="text-[9px] font-mono text-primary mt-0.5">{d.a}</div>
                      </div>
                      <div className="flex-1">
                        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-[hsl(24_95%_53%)] rounded-full" style={{ width: `${d.b}%` }} />
                        </div>
                        <div className="text-[9px] font-mono text-[hsl(24_95%_53%)] mt-0.5">{d.b}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Info Panel (non-compare mode only) */}
      {!compare && (
        <div className="gradient-card rounded-xl border border-border p-5">
          {selectedTeam && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedTeam.flag}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedTeam.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedTeam.league_name} • {selectedTeam.tactical_style}</p>
                </div>
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1 tracking-wider">Performance</div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <div className="text-center bg-signal-bullish/10 rounded-lg p-1.5">
                      <div className="font-mono font-bold text-signal-bullish">{selectedTeam.performance_4y?.win}%</div>
                      <div className="text-[9px] text-muted-foreground">Win</div>
                    </div>
                    <div className="text-center bg-secondary/60 rounded-lg p-1.5">
                      <div className="font-mono font-bold text-muted-foreground">{selectedTeam.performance_4y?.draw}%</div>
                      <div className="text-[9px] text-muted-foreground">Draw</div>
                    </div>
                    <div className="text-center bg-signal-bearish/10 rounded-lg p-1.5">
                      <div className="font-mono font-bold text-signal-bearish">{selectedTeam.performance_4y?.loss}%</div>
                      <div className="text-[9px] text-muted-foreground">Loss</div>
                    </div>
                  </div>
                </div>
                {selectedTeam.key_metrics && (
                  <div className="space-y-1.5">
                    {[
                      { l: "Goals For/G", v: selectedTeam.key_metrics.goalsFor },
                      { l: "Goals Against/G", v: selectedTeam.key_metrics.goalsAgainst },
                      { l: "Clean Sheet %", v: `${selectedTeam.key_metrics.cleanSheet}%` },
                      { l: "BTTS Rate", v: `${selectedTeam.key_metrics.btts}%` },
                    ].map((r) => (
                      <div key={r.l} className="flex justify-between">
                        <span className="text-muted-foreground">{r.l}</span>
                        <span className="font-mono text-foreground">{r.v}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <div className="text-[10px] text-muted-foreground mb-1">Form</div>
                  <div className="flex gap-1">
                    {selectedTeam.form_trend.map((f, i) => (
                      <span key={i} className={cn(
                        "w-5 h-5 rounded text-[10px] font-bold flex items-center justify-center",
                        f === "W" ? "bg-signal-bullish/20 text-signal-bullish" :
                        f === "D" ? "bg-signal-neutral/20 text-signal-neutral" :
                        f === "L" ? "bg-signal-bearish/20 text-signal-bearish" :
                        "bg-secondary text-foreground"
                      )}>{f}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedPlayer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedPlayer.flag}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedPlayer.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedPlayer.position} • {selectedPlayer.club}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { l: "Minutes", v: `${selectedPlayer.minutes_played}'` },
                  { l: "Fatigue", v: selectedPlayer.fatigue },
                  { l: "Form", v: selectedPlayer.form_trend.join(" ") },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between">
                    <span className="text-muted-foreground">{r.l}</span>
                    <span className="font-mono text-foreground">{r.v}</span>
                  </div>
                ))}
                <div className="pt-2">
                  <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Signals</div>
                  <div className="space-y-1.5">
                    {Object.entries(selectedPlayer.signals).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-[10px] mb-0.5">
                          <span className="text-muted-foreground capitalize">{k.replace("_", " ")}</span>
                          <span className="font-mono">{v}</span>
                        </div>
                        <div className="h-1 bg-secondary rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full", v >= 80 ? "bg-signal-bullish" : v >= 60 ? "bg-primary" : "bg-signal-bearish")} style={{ width: `${v}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedCoach && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{selectedCoach.flag}</span>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{selectedCoach.name}</h3>
                  <p className="text-[10px] text-muted-foreground">{selectedCoach.team} • {selectedCoach.formation_preference}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs">
                {[
                  { l: "Big Match", v: selectedCoach.big_match_record },
                  { l: "Subs", v: selectedCoach.substitution_tendency },
                ].map((r) => (
                  <div key={r.l} className="flex justify-between">
                    <span className="text-muted-foreground">{r.l}</span>
                    <span className="text-foreground">{r.v}</span>
                  </div>
                ))}
                {selectedCoach.controversy_flags.length > 0 && (
                  <div className="pt-2">
                    <div className="text-[10px] text-signal-bearish mb-1">⚠ Flags</div>
                    {selectedCoach.controversy_flags.map((f, i) => (
                      <div key={i} className="text-[10px] text-muted-foreground">{f}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {!selectedTeam && !selectedPlayer && !selectedCoach && (
            <div className="text-center py-8">
              <Eye className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Select an entity to see details</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Elite Page ─────────────────────────────────────────────────────────────
const Elite = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") || "twin";

  const handleTabChange = (val: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", val);
      return next;
    });
  };

  const content = (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Crown className="w-6 h-6 text-primary" />
              Elite Intelligence
              <EliteBadge />
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Deep, scout-level profiles for top clubs, players, and coaches worldwide.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground bg-secondary/60 px-3 py-2 rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-signal-bullish animate-pulse" />
            <span>Alpha feature • Use alongside your own scouting notes</span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="twin" className="text-xs font-mono">Digital Twin</TabsTrigger>
            <TabsTrigger value="dd" className="text-xs font-mono">Due Diligence</TabsTrigger>
            <TabsTrigger value="radar" className="text-xs font-mono">Radar Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="twin"><DigitalTwinTab /></TabsContent>
          <TabsContent value="dd"><DueDiligenceTab /></TabsContent>
          <TabsContent value="radar"><RadarAnalyticsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pb-10">
        <ProGate label="Unlock Elite Digital Twins">{content}</ProGate>
      </div>
    </div>
  );
};

export default Elite;
