import { useState, useMemo } from "react";
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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
import { leagues } from "@/lib/leagueData";
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
    return eliteTeams.map((t) => ({
      id: t.id,
      name: t.name,
      flag: t.flag,
      sub: t.country,
      league: t.league_name,
    }));
  if (type === "player")
    return elitePlayers.map((p) => ({
      id: p.id,
      name: p.name,
      flag: p.flag,
      sub: `${p.position} — ${p.club}`,
      league: p.league_name,
    }));
  return eliteCoaches.map((c) => ({
    id: c.id,
    name: c.name,
    flag: c.flag,
    sub: c.team,
    league: c.league_name,
  }));
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

const EliteBadge = () => (
  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 ml-2">
    ELITE
  </span>
);

// ─── Digital Twin Tab ──────────────────────────────────────────────────────
const DigitalTwinTab = () => {
  const [entityType, setEntityType] = useState<EntityType>("team");
  const [selectedId, setSelectedId] = useState("t1");
  const [search, setSearch] = useState("");

  const entities = useMemo(() => {
    const all = getEntities(entityType);
    if (!search) return all;
    return all.filter((e) =>
      e.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [entityType, search]);

  const entity = getEntity(entityType, selectedId);

  const handleTypeChange = (t: EntityType) => {
    setEntityType(t);
    const first = getEntities(t)[0];
    if (first) setSelectedId(first.id);
    setSearch("");
  };

  const signals =
    entity && "signals" in entity ? (entity as EliteTeam).signals : null;
  const timeline =
    entity && "timeline" in entity
      ? ((entity as EliteTeam).timeline ?? [])
      : [];
  const twinStatus =
    entity && "twin_status" in entity
      ? (entity as EliteTeam).twin_status
      : "limited";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left — Entity Selector */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Select Entity
          </h3>
          <EliteBadge />
        </div>
        <div className="flex gap-1 mb-3">
          {(
            [
              ["team", Users],
              ["player", User],
              ["coach", Briefcase],
            ] as [EntityType, typeof Users][]
          ).map(([t, Icon]) => (
            <button
              key={t}
              onClick={() => handleTypeChange(t)}
              className={cn(
                "flex-1 text-xs font-mono py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors capitalize",
                entityType === t
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3 h-3" /> {t}
            </button>
          ))}
        </div>
        <div className="relative mb-3">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 h-8 text-xs bg-secondary border-border"
          />
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {entities.map((e) => (
            <button
              key={e.id}
              onClick={() => setSelectedId(e.id)}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                selectedId === e.id
                  ? "bg-primary/10 text-foreground border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <span className="mr-2">{e.flag}</span>
              <span className="font-medium">{e.name}</span>
              <span className="text-[10px] text-muted-foreground ml-2">
                {e.sub}
              </span>
              <span className="text-[9px] font-mono text-primary/70 ml-1">
                ({e.league})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle — Digital Twin Overview */}
      <div className="gradient-card rounded-xl border border-primary/20 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Digital Twin Overview
          </h3>
        </div>
        {entity ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-2xl">
                {(entity as { flag?: string }).flag ?? "⚽"}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {(entity as { name?: string }).name}
                </div>
                <div
                  className={cn(
                    "text-[10px] font-mono px-1.5 py-0.5 rounded inline-block mt-0.5",
                    twinStatus === "up-to-date"
                      ? "bg-signal-bullish/10 text-signal-bullish"
                      : twinStatus === "updating"
                        ? "bg-signal-neutral/10 text-signal-neutral"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {twinStatus === "up-to-date"
                    ? "✓ Up to date"
                    : twinStatus === "updating"
                      ? "⟳ Updating"
                      : "◌ Limited data"}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-secondary-foreground">
              {"form_trend" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Form (last 5):</span>
                  <span className="font-mono">
                    {(entity as EliteTeam).form_trend.join(" ")}
                  </span>
                </div>
              )}
              {"tactical_style" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Style:</span>
                  <span>{(entity as EliteTeam).tactical_style}</span>
                </div>
              )}
              {"position" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position:</span>
                  <span>{(entity as ElitePlayer).position}</span>
                </div>
              )}
              {"formation_preference" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Formation:</span>
                  <span>{(entity as EliteCoach).formation_preference}</span>
                </div>
              )}
              {"injury_impact" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Injury Impact:</span>
                  <span className="font-mono">
                    {(entity as EliteTeam).injury_impact}/100
                  </span>
                </div>
              )}
              {"minutes_played" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Minutes:</span>
                  <span className="font-mono">
                    {(entity as ElitePlayer).minutes_played}'
                  </span>
                </div>
              )}
              {"news_sentiment" in entity && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">News Sentiment:</span>
                  <span className="font-mono">
                    {(entity as EliteTeam).news_sentiment}/100
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select an entity</p>
        )}
      </div>

      {/* Right — Twin Signals & Last 7 Days */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Twin Signals
          </h3>
          <EliteBadge />
        </div>
        {signals && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {Object.entries(signals).map(([key, value]) => (
              <div
                key={key}
                className="bg-secondary/50 rounded-lg p-2 text-center"
              >
                <div className="text-[10px] text-muted-foreground capitalize mb-1">
                  {key.replace("_", " ")}
                </div>
                <div
                  className={cn(
                    "font-mono text-lg font-bold",
                    value >= 80
                      ? "text-signal-bullish"
                      : value >= 60
                        ? "text-primary"
                        : "text-signal-bearish"
                  )}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold">
            Last 7 Days
          </div>
          <div className="space-y-2">
            {timeline.length > 0 ? (
              timeline.map((ev, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div
                    className={cn(
                      "w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0",
                      ev.type === "positive"
                        ? "bg-signal-bullish"
                        : ev.type === "negative"
                          ? "bg-signal-bearish"
                          : "bg-signal-neutral"
                    )}
                  />
                  <div>
                    <div className="text-xs text-foreground">{ev.event}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {ev.date}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">No recent events</p>
            )}
          </div>
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
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            {section.title}
          </h4>
          <p className="text-xs text-muted-foreground mt-0.5">
            {section.summary}
          </p>
        </div>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      {open && (
        <ul className="mt-3 space-y-1.5 pl-3 border-l border-border">
          {section.details.map((d, i) => (
            <li key={i} className="text-xs text-secondary-foreground">
              {d}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const DueDiligenceTab = () => (
  <div className="space-y-4">
    {ddReportSections.map((s) => (
      <DDSection key={s.title} section={s} />
    ))}

    <div className="gradient-card rounded-xl border border-primary/30 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">Risk Flags</h4>
        <EliteBadge />
      </div>
      <div className="space-y-2">
        {riskFlags.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "w-2 h-2 rounded-full flex-shrink-0",
                f.level === "red"
                  ? "bg-signal-bearish"
                  : f.level === "amber"
                    ? "bg-signal-neutral"
                    : "bg-signal-bullish"
              )}
            />
            <span className="text-xs text-secondary-foreground">{f.text}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="gradient-card rounded-xl border border-border p-5">
      <h4 className="text-sm font-semibold text-foreground mb-3">Sources</h4>
      <div className="flex flex-wrap gap-2">
        {mockSources.map((s, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-secondary/50 rounded-lg px-3 py-1.5"
          >
            <span
              className={cn(
                "text-[10px] font-mono px-1.5 py-0.5 rounded",
                s.type === "News"
                  ? "bg-primary/10 text-primary"
                  : s.type === "Injury report"
                    ? "bg-signal-bearish/10 text-signal-bearish"
                    : "bg-signal-neutral/10 text-signal-neutral"
              )}
            >
              {s.type}
            </span>
            <span className="text-xs text-secondary-foreground">{s.name}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-3">
        Sources are structured for future API integration.
      </p>
    </div>
  </div>
);

// ─── Radar Analytics Tab ────────────────────────────────────────────────────
const FilterSelect = ({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <div className="space-y-1">
    <label className="text-[10px] text-muted-foreground font-mono uppercase">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
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
  const [teamFilter, setTeamFilter] = useState("all");

  const competitionOptions = useMemo(
    () => [
      { value: "all", label: "All Competitions" },
      ...leagues.map((l) => ({ value: l.id, label: `${l.logo} ${l.shortName}` })),
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

  const availableTeams = useMemo(() => {
    const map = new Map<string, string>();
    eliteTeams.forEach((t) => map.set(t.name, t.flag));
    elitePlayers.forEach((p) => map.set(p.club, p.flag));
    eliteCoaches.forEach((c) => map.set(c.team, c.flag));
    return Array.from(map.entries())
      .map(([name, flag]) => ({ value: name, label: `${flag} ${name}` }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const filteredEntities = useMemo(() => {
    let items: { id: string; name: string; flag: string; sub: string }[] = [];
    if (entityType === "team") {
      items = eliteTeams.map((t) => ({
        id: t.id,
        name: `${t.name} (National Team)`,
        flag: t.flag,
        sub: t.country,
      }));
    } else if (entityType === "player") {
      items = elitePlayers.map((p) => ({
        id: p.id,
        name: p.name,
        flag: p.flag,
        sub: `${p.position} • ${p.club} • ${p.country}`,
      }));
    } else {
      items = eliteCoaches.map((c) => ({
        id: c.id,
        name: c.name,
        flag: c.flag,
        sub: `${c.team} • ${c.country} • ${c.league_name}`,
      }));
    }
    if (competitionFilter !== "all") {
      items = items.filter((e) => {
        const ent = entityType === "team"
          ? eliteTeams.find((t) => t.id === e.id)
          : entityType === "player"
            ? elitePlayers.find((p) => p.id === e.id)
            : eliteCoaches.find((c) => c.id === e.id);
        return ent?.league_id === competitionFilter;
      });
    }
    if (countryFilter !== "all")
      items = items.filter((e) => e.sub.includes(countryFilter));
    if (teamFilter !== "all" && entityType !== "team")
      items = items.filter((e) => e.sub.includes(teamFilter));
    return items;
  }, [entityType, competitionFilter, countryFilter, teamFilter]);

  const axes = getRadarAxes(entityType);
  const entityA = getEntity(entityType, entityAId);
  const entityB = compare ? getEntity(entityType, entityBId) : null;

  const axisData = axes.map((axis) => ({
    axis,
    A:
      entityA && "radar_scores" in entityA
        ? (entityA as EliteTeam).radar_scores[axis] ?? 0
        : 0,
    ...(entityB && "radar_scores" in entityB
      ? { B: (entityB as EliteTeam).radar_scores[axis] ?? 0 }
      : {}),
  }));

  const entityOptions = filteredEntities.map((e) => ({
    value: e.id,
    label: `${e.flag} ${e.name}`,
  }));

  const selectedTeam =
    entityType === "team"
      ? eliteTeams.find((t) => t.id === entityAId) ?? eliteTeams[0]
      : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters */}
      <div className="gradient-card rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Filter className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Filters</h3>
          <EliteBadge />
        </div>
        <FilterSelect
          label="Entity"
          value={entityType}
          onChange={(v) => setEntityType(v as EntityType)}
          options={[
            { value: "team", label: "Team" },
            { value: "player", label: "Player" },
            { value: "coach", label: "Coach" },
          ]}
        />
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <input
            type="checkbox"
            className="rounded border-border bg-secondary"
            checked={compare}
            onChange={(e) => setCompare(e.target.checked)}
          />
          Compare OFF
        </div>
        <FilterSelect
          label="Competition"
          value={competitionFilter}
          onChange={setCompetitionFilter}
          options={competitionOptions}
        />
        <FilterSelect
          label="Country"
          value={countryFilter}
          onChange={setCountryFilter}
          options={[
            { value: "all", label: "All Countries" },
            ...availableCountries.map((c) => ({ value: c, label: c })),
          ]}
        />
        <FilterSelect
          label="SELECT TEAM"
          value={entityAId}
          onChange={setEntityAId}
          options={
            entityOptions.length > 0
              ? entityOptions
              : [{ value: "t1", label: "🇧🇷 Brazil (National Team)" }]
          }
        />
      </div>

      {/* Octagon Radar */}
      <div className="gradient-card rounded-xl border border-border p-5 lg:col-span-2">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Octagon Radar
          <EliteBadge />
        </h3>
        <div className="h-64 mb-4">
          {entityA ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={axisData}>
                <PolarGrid stroke="hsl(215 16% 27%)" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fill: "hsl(215 20% 65%)", fontSize: 10 }}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fill: "hsl(215 20% 55%)", fontSize: 9 }}
                />
                <Radar
                  name={entityType === "team" ? (entityA as EliteTeam).name : "A"}
                  dataKey="A"
                  stroke="#14b8a6"
                  fill="#14b8a633"
                  fillOpacity={0.5}
                />
                {compare && entityB && (
                  <Radar
                    name={
                      entityType === "team"
                        ? (entityB as EliteTeam).name
                        : "B"
                    }
                    dataKey="B"
                    stroke="#f97316"
                    fill="#f9731633"
                    fillOpacity={0.4}
                  />
                )}
                <Legend
                  wrapperStyle={{ fontSize: 11, color: "hsl(215 20% 65%)" }}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
              Select an entity
            </div>
          )}
        </div>
        {entityA && "radar_scores" in entityA && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            {axes.map((ax) => (
              <div key={ax} className="flex justify-between">
                <span className="text-muted-foreground">{ax}:</span>
                <span className="font-mono">
                  {(entityA as EliteTeam).radar_scores[ax] ?? 0}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Team Profile */}
      {selectedTeam && (
        <div className="gradient-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Team Profile
          </h3>
          <p className="text-[10px] text-muted-foreground mb-4">
            Updated {selectedTeam.last_updated}
          </p>

          <div className="space-y-4 text-xs">
            <div>
              <h4 className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                BASICS
              </h4>
              <div className="space-y-1">
                <div>Team: {selectedTeam.name}</div>
                <div>Competition: {selectedTeam.league_name}</div>
                <div>
                  Head Coach:{" "}
                  {eliteCoaches.find((c) => c.team === selectedTeam.name)?.name}{" "}
                  (
                  {
                    eliteCoaches.find((c) => c.team === selectedTeam.name)
                      ?.country
                  }
                  )
                </div>
              </div>
            </div>

            {selectedTeam.squad_snapshot && (
              <div>
                <h4 className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  SQUAD SNAPSHOT
                </h4>
                <ul className="space-y-1">
                  {selectedTeam.squad_snapshot.map((s, i) => (
                    <li key={i}>
                      {s.name} ({s.position}): {s.rating}
                    </li>
                  ))}
                  {selectedTeam.avg_age != null && (
                    <li>Avg Age: {selectedTeam.avg_age}</li>
                  )}
                  {selectedTeam.rotation_depth != null && (
                    <li>Rotation Depth: {selectedTeam.rotation_depth}/100</li>
                  )}
                </ul>
              </div>
            )}

            {selectedTeam.performance_4y && (
              <div>
                <h4 className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  PERFORMANCE (4Y)
                </h4>
                <div className="space-y-1">
                  <div>Win: {selectedTeam.performance_4y.win}%</div>
                  <div>Draw: {selectedTeam.performance_4y.draw}%</div>
                  <div>Loss: {selectedTeam.performance_4y.loss}%</div>
                </div>
              </div>
            )}

            {selectedTeam.key_metrics && (
              <div>
                <h4 className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  Key Metrics
                </h4>
                <div className="space-y-1">
                  <div>Goals For / Game: {selectedTeam.key_metrics.goalsFor}</div>
                  <div>
                    Goals Against / Game: {selectedTeam.key_metrics.goalsAgainst}
                  </div>
                  <div>
                    Clean Sheet Rate: {selectedTeam.key_metrics.cleanSheet}%
                  </div>
                  <div>BTTS Rate: {selectedTeam.key_metrics.btts}%</div>
                  <div>Home Win Rate: {selectedTeam.key_metrics.homeWin}%</div>
                  <div>Away Win Rate: {selectedTeam.key_metrics.awayWin}%</div>
                </div>
              </div>
            )}

            {selectedTeam.style_indicators && (
              <div>
                <h4 className="text-[10px] font-mono uppercase text-muted-foreground mb-1">
                  STYLE INDICATORS
                </h4>
                <div className="space-y-2">
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span>Press Intensity</span>
                      <span>{selectedTeam.style_indicators.pressIntensity}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${selectedTeam.style_indicators.pressIntensity}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5">
                      <span>Possession Bias</span>
                      <span>
                        {selectedTeam.style_indicators.possessionBias}
                      </span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${selectedTeam.style_indicators.possessionBias}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
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
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Elite Intelligence
              <EliteBadge />
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Deep, scout-level profiles for top clubs, players, and coaches
              worldwide.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground bg-secondary/60 px-3 py-2 rounded-full border border-border">
            <span className="w-2 h-2 rounded-full bg-signal-bullish animate-pulse" />
            <span>Alpha feature • Use alongside your own scouting notes</span>
          </div>
        </div>

        <Tabs value={tab} onValueChange={handleTabChange}>
          <TabsList className="mb-6">
            <TabsTrigger value="twin" className="text-xs font-mono">
              Digital Twin
            </TabsTrigger>
            <TabsTrigger value="dd" className="text-xs font-mono">
              Due Diligence
            </TabsTrigger>
            <TabsTrigger value="radar" className="text-xs font-mono">
              Radar Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twin">
            <DigitalTwinTab />
          </TabsContent>
          <TabsContent value="dd">
            <DueDiligenceTab />
          </TabsContent>
          <TabsContent value="radar">
            <RadarAnalyticsTab />
          </TabsContent>
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
