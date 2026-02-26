import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { useUserTier } from "@/contexts/UserTierContext";
import ProGate from "@/components/ProGate";
import { cn } from "@/lib/utils";
import { Crown, Search, AlertTriangle, ChevronDown, ChevronUp, Users, User, Briefcase } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  eliteTeams, elitePlayers, eliteCoaches,
  teamRadarAxes, playerRadarAxes, coachRadarAxes,
  ddReportSections, riskFlags, mockSources,
  type EliteTeam, type ElitePlayer, type EliteCoach,
} from "@/lib/eliteData";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer } from "recharts";
import { useSearchParams } from "react-router-dom";

// ─── Helpers ────────────────────────────────────────────────────
type EntityType = "team" | "player" | "coach";

const getEntities = (type: EntityType) => {
  if (type === "team") return eliteTeams.map(t => ({ id: t.id, name: t.name, flag: t.flag, sub: t.country }));
  if (type === "player") return elitePlayers.map(p => ({ id: p.id, name: p.name, flag: p.flag, sub: `${p.position} — ${p.club}` }));
  return eliteCoaches.map(c => ({ id: c.id, name: c.name, flag: c.flag, sub: c.team }));
};

const getEntity = (type: EntityType, id: string) => {
  if (type === "team") return eliteTeams.find(t => t.id === id);
  if (type === "player") return elitePlayers.find(p => p.id === id);
  return eliteCoaches.find(c => c.id === id);
};

const getRadarAxes = (type: EntityType) => {
  if (type === "team") return teamRadarAxes;
  if (type === "player") return playerRadarAxes;
  return coachRadarAxes;
};

const EliteBadge = () => (
  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 ml-2">ELITE</span>
);

// ─── Digital Twin Tab ───────────────────────────────────────────
const DigitalTwinTab = () => {
  const [entityType, setEntityType] = useState<EntityType>("team");
  const [selectedId, setSelectedId] = useState("t1");
  const [search, setSearch] = useState("");

  const entities = useMemo(() => {
    const all = getEntities(entityType);
    if (!search) return all;
    return all.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));
  }, [entityType, search]);

  const entity = getEntity(entityType, selectedId);

  // Reset selection when type changes
  const handleTypeChange = (t: EntityType) => {
    setEntityType(t);
    const first = getEntities(t)[0];
    if (first) setSelectedId(first.id);
    setSearch("");
  };

  const signals = entity && "signals" in entity ? (entity as any).signals : null;
  const timeline = entity && "timeline" in entity ? (entity as any).timeline : [];
  const twinStatus = entity && "twin_status" in entity ? (entity as any).twin_status : "limited";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left — Entity Selector */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Select Entity</h3>
          <EliteBadge />
        </div>
        <div className="flex gap-1 mb-3">
          {([["team", Users], ["player", User], ["coach", Briefcase]] as [EntityType, any][]).map(([t, Icon]) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={cn("flex-1 text-xs font-mono py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors capitalize",
                entityType === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3 h-3" /> {t}
            </button>
          ))}
        </div>
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search…" className="pl-8 h-8 text-xs bg-secondary border-border" />
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {entities.map(e => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={cn("w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedId === e.id ? "bg-primary/10 text-foreground border border-primary/20" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span className="mr-2">{e.flag}</span>
              <span className="font-medium">{e.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{e.sub}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle — Twin Overview */}
      <div className="gradient-card rounded-xl border border-primary/20 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Digital Twin Overview</h3>
        </div>
        {entity ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                {(entity as any).flag}
              </div>
              <div>
                <div className="font-semibold text-foreground">{(entity as any).name}</div>
                <div className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded inline-block mt-0.5",
                  twinStatus === "up-to-date" ? "bg-signal-bullish/10 text-signal-bullish" :
                  twinStatus === "updating" ? "bg-signal-neutral/10 text-signal-neutral" :
                  "bg-muted text-muted-foreground"
                )}>
                  {twinStatus === "up-to-date" ? "✓ Up to date" : twinStatus === "updating" ? "⟳ Updating" : "◌ Limited data"}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-secondary-foreground">
              {"form_trend" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Form (last 5):</span><span className="font-mono">{(entity as any).form_trend.join(" ")}</span></div>
              )}
              {"tactical_style" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Style:</span><span>{(entity as any).tactical_style}</span></div>
              )}
              {"position" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Position:</span><span>{(entity as any).position}</span></div>
              )}
              {"formation_preference" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Formation:</span><span>{(entity as any).formation_preference}</span></div>
              )}
              {"injury_impact" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Injury Impact:</span><span className="font-mono">{(entity as any).injury_impact}/100</span></div>
              )}
              {"minutes_played" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Minutes:</span><span className="font-mono">{(entity as any).minutes_played}'</span></div>
              )}
              {"big_match_record" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">Big match:</span><span>{(entity as any).big_match_record}</span></div>
              )}
              {"news_sentiment" in (entity as any) && (
                <div className="flex justify-between"><span className="text-muted-foreground">News Sentiment:</span><span className="font-mono">{(entity as any).news_sentiment}/100</span></div>
              )}
            </div>
          </div>
        ) : <p className="text-sm text-muted-foreground">Select an entity</p>}
      </div>

      {/* Right — Twin Signals */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Twin Signals</h3>
          <EliteBadge />
        </div>
        {signals && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {Object.entries(signals).map(([key, value]) => (
              <div key={key} className="bg-secondary/50 rounded-lg p-2 text-center">
                <div className="text-[10px] text-muted-foreground capitalize mb-1">{key.replace("_", " ")}</div>
                <div className={cn("font-mono text-lg font-bold",
                  (value as number) >= 80 ? "text-signal-bullish" : (value as number) >= 60 ? "text-primary" : "text-signal-bearish"
                )}>{value as number}</div>
              </div>
            ))}
          </div>
        )}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold">Last 7 Days</div>
          <div className="space-y-2">
            {timeline.map((ev: any, i: number) => (
              <div key={i} className="flex items-start gap-2">
                <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                  ev.type === "positive" ? "bg-signal-bullish" : ev.type === "negative" ? "bg-signal-bearish" : "bg-signal-neutral"
                )} />
                <div>
                  <div className="text-xs text-foreground">{ev.event}</div>
                  <div className="text-[10px] text-muted-foreground">{ev.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Due Diligence Tab ──────────────────────────────────────────
const DDSection = ({ section }: { section: typeof ddReportSections[0] }) => {
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
    {ddReportSections.map(s => <DDSection key={s.title} section={s} />)}

    {/* Risk Flags */}
    <div className="gradient-card rounded-xl border border-primary/30 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Risk Flags</h4>
        <EliteBadge />
      </div>
      <div className="space-y-2">
        {riskFlags.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full flex-shrink-0",
              f.level === "red" ? "bg-signal-bearish" : f.level === "amber" ? "bg-signal-neutral" : "bg-signal-bullish"
            )} />
            <span className="text-xs text-secondary-foreground">{f.text}</span>
          </div>
        ))}
      </div>
    </div>

    {/* Sources */}
    <div className="gradient-card rounded-xl border border-border p-5">
      <h4 className="text-sm font-semibold text-foreground mb-3">Sources</h4>
      <div className="flex flex-wrap gap-2">
        {mockSources.map((s, i) => (
          <div key={i} className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5">
            <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded",
              s.type === "News" ? "bg-primary/10 text-primary" :
              s.type === "Injury report" ? "bg-signal-bearish/10 text-signal-bearish" :
              "bg-signal-neutral/10 text-signal-neutral"
            )}>{s.type}</span>
            <span className="text-xs text-secondary-foreground">{s.name}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        {/* TODO: Link to actual sources when API is integrated */}
        Sources are structured placeholders for future integration.
      </p>
    </div>
  </div>
);

// ─── Radar Analytics Tab ────────────────────────────────────────
const RadarAnalyticsTab = () => {
  const [entityType, setEntityType] = useState<EntityType>("team");
  const [compare, setCompare] = useState(false);
  const [entityAId, setEntityAId] = useState("t1");
  const [entityBId, setEntityBId] = useState("t2");

  const entities = getEntities(entityType);
  const axes = getRadarAxes(entityType);
  const entityA = getEntity(entityType, entityAId);
  const entityB = compare ? getEntity(entityType, entityBId) : null;

  const radarData = axes.map(axis => ({
    axis,
    A: entityA ? (entityA as any).radar_scores[axis] ?? 0 : 0,
    ...(entityB ? { B: (entityB as any).radar_scores[axis] ?? 0 } : {}),
  }));

  const handleTypeChange = (t: EntityType) => {
    setEntityType(t);
    const ents = getEntities(t);
    if (ents[0]) setEntityAId(ents[0].id);
    if (ents[1]) setEntityBId(ents[1].id);
  };

  // Takeaways
  const takeaways = useMemo(() => {
    if (!entityA) return [];
    const scores = (entityA as any).radar_scores as Record<string, number>;
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const bullets: string[] = [];
    bullets.push(`Strongest: ${sorted[0][0]} (${sorted[0][1]})`);
    bullets.push(`Weakest: ${sorted[sorted.length - 1][0]} (${sorted[sorted.length - 1][1]})`);
    if (entityB) {
      const scoresB = (entityB as any).radar_scores as Record<string, number>;
      const biggest = Object.keys(scores).reduce((best, key) => {
        const diff = scores[key] - (scoresB[key] ?? 0);
        return diff > (best.diff ?? -Infinity) ? { key, diff } : best;
      }, { key: "", diff: -Infinity });
      bullets.push(`Biggest advantage vs ${(entityB as any).name}: ${biggest.key} (+${biggest.diff})`);
    }
    return bullets;
  }, [entityA, entityB]);

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-1">
            {(["team", "player", "coach"] as EntityType[]).map(t => (
              <button key={t} onClick={() => handleTypeChange(t)}
                className={cn("text-xs font-mono px-3 py-1.5 rounded-md capitalize transition-colors",
                  entityType === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
                )}>{t}</button>
            ))}
          </div>
          <button onClick={() => setCompare(!compare)}
            className={cn("text-xs font-mono px-3 py-1.5 rounded-md transition-colors",
              compare ? "bg-primary/20 text-primary border border-primary/30" : "bg-secondary text-muted-foreground hover:text-foreground"
            )}>Compare {compare ? "ON" : "OFF"}</button>
        </div>

        <div className="flex flex-wrap gap-3">
          <select value={entityAId} onChange={e => setEntityAId(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
            {entities.map(e => <option key={e.id} value={e.id}>{e.flag} {e.name}</option>)}
          </select>
          {compare && (
            <>
              <span className="text-muted-foreground text-sm self-center">vs</span>
              <select value={entityBId} onChange={e => setEntityBId(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                {entities.map(e => <option key={e.id} value={e.id}>{e.flag} {e.name}</option>)}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Radar Chart */}
      <div className="gradient-card rounded-xl border border-primary/20 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Octagon Radar</h3>
          <EliteBadge />
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(222 30% 20%)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: "hsl(215 20% 55%)", fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "hsl(215 20% 45%)", fontSize: 9 }} />
              <Radar name={entityA ? (entityA as any).name : "A"} dataKey="A" stroke="hsl(175 85% 50%)" fill="hsl(175 85% 50%)" fillOpacity={0.2} strokeWidth={2} />
              {compare && entityB && (
                <Radar name={(entityB as any).name} dataKey="B" stroke="hsl(145 70% 50%)" fill="hsl(145 70% 50%)" fillOpacity={0.15} strokeWidth={2} />
              )}
              <Legend wrapperStyle={{ fontSize: 11, color: "hsl(210 40% 93%)" }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Score Breakdown */}
        <div className="mt-4 border-t border-border pt-4">
          <h4 className="text-xs font-semibold text-muted-foreground mb-2">Score Breakdown</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {radarData.map(d => (
              <div key={d.axis} className="bg-secondary/50 rounded-lg p-2">
                <div className="text-[10px] text-muted-foreground">{d.axis}</div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-primary">{d.A}</span>
                  {compare && d.B !== undefined && <span className="font-mono text-sm font-bold text-accent">{d.B}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Takeaways */}
        {takeaways.length > 0 && (
          <div className="mt-4 border-t border-border pt-4">
            <h4 className="text-xs font-semibold text-muted-foreground mb-2">Key Takeaways</h4>
            <ul className="space-y-1">
              {takeaways.map((t, i) => (
                <li key={i} className="text-xs text-secondary-foreground">• {t}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main Elite Page ────────────────────────────────────────────
const Elite = () => {
  const { isElite } = useUserTier();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "digital-twin";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <Crown className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Elite Intelligence</h1>
            <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">ELITE</span>
          </div>

          <ProGate requiredTier="elite" label="Unlock Elite Intelligence — Digital Twin, Due Diligence & Radar Analytics">
            <Tabs defaultValue={defaultTab}>
              <TabsList className="bg-secondary border border-border mb-6">
                <TabsTrigger value="digital-twin" className="text-xs font-mono">Digital Twin</TabsTrigger>
                <TabsTrigger value="due-diligence" className="text-xs font-mono">Due Diligence</TabsTrigger>
                <TabsTrigger value="radar" className="text-xs font-mono">Radar Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="digital-twin"><DigitalTwinTab /></TabsContent>
              <TabsContent value="due-diligence"><DueDiligenceTab /></TabsContent>
              <TabsContent value="radar"><RadarAnalyticsTab /></TabsContent>
            </Tabs>
          </ProGate>
        </div>
      </div>
    </div>
  );
};

export default Elite;
