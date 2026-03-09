import { useEffect, useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Crown, Users, User, Briefcase } from "lucide-react";
import { eliteTeams, elitePlayers, eliteCoaches } from "@/lib/eliteData";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

type EliteTeamLite = {
  id: string | number;
  name: string;
  short_code?: string | null;
  image_path?: string | null;
};

type EliteCoachLite = {
  id: string | number;
  name: string;
  nationality?: string | null;
};

type ElitePlayerLite = {
  id: string | number;
  name: string;
  position?: string | null;
  number?: number | null;
  image_path?: string | null;
  goals?: number | null;
};

type EliteFormStats = {
  winRate: number;
  goalsForPerGame: number;
  goalsAgainstPerGame: number;
  cleanSheetRate: number;
  bttsRate: number;
};

const EliteBadge = () => (
  <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 ml-2">
    ELITE
  </span>
);

const DigitalTwinTab = ({
  teams,
  selectedTeamId,
  onSelectTeam,
  coach,
  players,
  formStats,
  lastMatches,
  fetchedAt,
}: {
  teams: EliteTeamLite[];
  selectedTeamId: string | null;
  onSelectTeam: (id: string) => void;
  coach: EliteCoachLite | null;
  players: ElitePlayerLite[];
  formStats: EliteFormStats | null;
  lastMatches: any[];
  fetchedAt: string | null;
}) => {
  const [entityTab, setEntityTab] = useState<"team" | "player" | "coach">(
    "team",
  );
  const [search, setSearch] = useState("");

  const filteredTeams = useMemo(() => {
    if (!search) return teams;
    return teams.filter((t) =>
      t.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [teams, search]);

  const selectedTeam = teams.find((t) => String(t.id) === selectedTeamId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Team selector */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">Select Team</h3>
          <EliteBadge />
        </div>
        <div className="relative mb-3">
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teams…"
            className="h-8 text-xs bg-secondary border-border"
          />
        </div>
        <div className="space-y-1 max-h-64 overflow-y-auto">
          {filteredTeams.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelectTeam(String(t.id))}
              className={cn(
                "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2",
                selectedTeamId === String(t.id)
                  ? "bg-primary/10 text-foreground border border-primary/20"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-[11px]">
                {(t.short_code || t.name || "?")
                  .toString()
                  .slice(0, 3)
                  .toUpperCase()}
              </div>
              <span className="font-medium truncate">{t.name}</span>
            </button>
          ))}
          {filteredTeams.length === 0 && (
            <div className="text-xs text-muted-foreground">
              No teams for this league.
            </div>
          )}
        </div>
      </div>

      {/* Middle: Digital Twin Overview */}
      <div className="gradient-card rounded-xl border border-primary/20 p-5 shadow-[0_0_25px_hsl(175_85%_50%/0.08)]">
        <div className="flex items-center gap-2 mb-4">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">
            Digital Twin Overview
          </h3>
        </div>
        {selectedTeam ? (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                {(selectedTeam.short_code || selectedTeam.name)
                  .toString()
                  .slice(0, 3)
                  .toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {selectedTeam.name}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {coach?.name ? `Head coach: ${coach.name}` : "Coach: —"}
                </div>
                <div className="text-[9px] text-muted-foreground mt-0.5">
                  Data updated: {fetchedAt ?? "—"}
                </div>
              </div>
            </div>

            <div className="flex gap-1 mb-3">
              <button
                className={cn(
                  "flex-1 text-xs font-mono py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors",
                  entityTab === "team"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setEntityTab("team")}
              >
                <Users className="w-3 h-3" /> Team
              </button>
              <button
                className={cn(
                  "flex-1 text-xs font-mono py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors",
                  entityTab === "player"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setEntityTab("player")}
              >
                <User className="w-3 h-3" /> Players
              </button>
              <button
                className={cn(
                  "flex-1 text-xs font-mono py-1.5 rounded-md flex items-center justify-center gap-1 transition-colors",
                  entityTab === "coach"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-secondary text-muted-foreground hover:text-foreground",
                )}
                onClick={() => setEntityTab("coach")}
              >
                <Briefcase className="w-3 h-3" /> Coach
              </button>
            </div>

            {entityTab === "team" && (
              <div className="space-y-2 text-xs text-secondary-foreground">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Form (last 5):
                  </span>
                  <span className="font-mono">
                    {lastMatches
                      .slice(0, 5)
                      .map((m: any) => m.result)
                      .join(" ")}
                    {lastMatches.length === 0 && "—"}
                  </span>
                </div>
                {formStats && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Win rate:</span>
                      <span className="font-mono">
                        {formStats.winRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Goals for / game:
                      </span>
                      <span className="font-mono">
                        {formStats.goalsForPerGame.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Goals against / game:
                      </span>
                      <span className="font-mono">
                        {formStats.goalsAgainstPerGame.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}

            {entityTab === "player" && (
              <div className="space-y-1 max-h-52 overflow-y-auto text-xs">
                {players.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between py-1 border-b border-border/50 last:border-b-0"
                  >
                    <span className="text-foreground">
                      {p.name}{" "}
                      {p.position && (
                        <span className="text-[10px] text-muted-foreground">
                          ({p.position})
                        </span>
                      )}
                    </span>
                    {p.number != null && (
                      <span className="font-mono text-[10px] text-muted-foreground">
                        #{p.number}
                      </span>
                    )}
                  </div>
                ))}
                {players.length === 0 && (
                  <p className="text-xs text-muted-foreground">No players.</p>
                )}
              </div>
            )}

            {entityTab === "coach" && (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-mono">{coach?.name ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nationality:</span>
                  <span className="font-mono">
                    {coach?.nationality ?? "—"}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Select a league and team to view its digital twin.
          </p>
        )}
      </div>

      {/* Right: Last matches list */}
      <div className="gradient-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Recent Matches
          </h3>
          <EliteBadge />
        </div>
        {lastMatches.length === 0 ? (
          <p className="text-xs text-muted-foreground">No recent matches.</p>
        ) : (
          <div className="space-y-1 text-xs">
            {lastMatches.slice(0, 10).map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-1 border-b border-border/50 last:border-b-0"
              >
                <span className="text-muted-foreground truncate mr-2">
                  {m.home} vs {m.away}
                </span>
                <span className="font-mono text-[11px]">
                  {m.score} {m.result}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const DueDiligenceTab = ({
  formStats,
  players,
  fetchedAt,
}: {
  formStats: EliteFormStats | null;
  players: ElitePlayerLite[];
  fetchedAt: string | null;
}) => {
  const topScorers = useMemo(
    () =>
      players
        .filter((p) => typeof p.goals === "number")
        .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
        .slice(0, 5),
    [players],
  );

  return (
    <div className="space-y-4">
      <div className="gradient-card rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Performance Snapshot
        </h4>
        {formStats ? (
          <ul className="list-disc pl-4 space-y-1 text-xs text-secondary-foreground">
            <li>Win rate (last 10): {formStats.winRate.toFixed(1)}%</li>
            <li>
              Goals for per game: {formStats.goalsForPerGame.toFixed(2)}
            </li>
            <li>
              Goals against per game:{" "}
              {formStats.goalsAgainstPerGame.toFixed(2)}
            </li>
            <li>
              Clean sheet rate: {formStats.cleanSheetRate.toFixed(1)}%
            </li>
            <li>BTTS rate: {formStats.bttsRate.toFixed(1)}%</li>
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No form data.</p>
        )}
        <p className="text-[10px] text-muted-foreground mt-3">
          Data updated: {fetchedAt ?? "—"}
        </p>
      </div>

      <div className="gradient-card rounded-xl border border-border p-4">
        <h4 className="text-sm font-semibold text-foreground mb-2">
          Roster Highlights
        </h4>
        {topScorers.length > 0 ? (
          <ul className="space-y-1 text-xs text-secondary-foreground">
            {topScorers.map((p) => (
              <li key={p.id} className="flex items-center justify-between">
                <span>{p.name}</span>
                <span className="font-mono">
                  {p.goals} goals
                  {p.position ? ` • ${p.position}` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">
            Goal data not available —.
          </p>
        )}
      </div>
    </div>
  );
};

const RadarAnalyticsTab = ({ formStats }: { formStats: EliteFormStats | null }) => {
  const attack = formStats
    ? Math.min(100, (formStats.goalsForPerGame / 3) * 100)
    : 50;
  const defense = formStats
    ? Math.min(
        100,
        Math.max(0, ((1.5 - formStats.goalsAgainstPerGame) / 1.5) * 100),
      )
    : 50;
  const discipline = 50;
  const setPieces = 50;

  const data = [
    { axis: "Attack", value: Math.round(attack) },
    { axis: "Defense", value: Math.round(defense) },
    { axis: "Discipline", value: Math.round(discipline) },
    { axis: "Set Pieces", value: Math.round(setPieces) },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="gradient-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          Team Radar
          <EliteBadge />
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={data}>
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
                name="Team"
                dataKey="value"
                stroke="#22c55e"
                fill="#22c55e33"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="gradient-card rounded-xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">
          Performance Metrics
        </h3>
        {formStats ? (
          <div className="space-y-1 text-xs text-secondary-foreground">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Attack score:</span>
              <span className="font-mono">{Math.round(attack)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Defense score:</span>
              <span className="font-mono">{Math.round(defense)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Clean sheet rate:</span>
              <span className="font-mono">
                {formStats.cleanSheetRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">BTTS rate:</span>
              <span className="font-mono">
                {formStats.bttsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No form stats available yet.
          </p>
        )}
      </div>
    </div>
  );
};

const Elite = () => {
  const { isPro } = useUserTier();
  const { selectedLeague } = useLeague();

  const leagueId = useMemo(() => {
    if (selectedLeague.startsWith("sm:")) {
      return selectedLeague.slice(3);
    }
    // Default to MLS (779) when a static league is selected
    return "779";
  }, [selectedLeague]);

  const {
    data: teamsData,
    isLoading: loadingTeams,
    error: teamsError,
  } = useQuery({
    queryKey: ["elite-teams", leagueId],
    queryFn: async () => {
      const search = new URLSearchParams({ type: "elite_teams", leagueId });
      const res = await fetch(`/api/sports?${search.toString()}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load teams");
      return json as {
        teams: EliteTeamLite[];
        seasonId: number | null;
        fetchedAt: string;
      };
    },
    enabled: !!leagueId,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  const useMockElite = !!teamsError;

  const teams: EliteTeamLite[] = useMockElite
    ? eliteTeams.map((t) => ({
        id: t.id,
        name: t.name,
        short_code: t.country.slice(0, 3).toUpperCase(),
        image_path: t.photo_url || null,
      }))
    : (teamsData?.teams ?? []);

  useEffect(() => {
    if (!selectedTeamId && teams.length > 0) {
      setSelectedTeamId(String(teams[0].id));
    }
  }, [selectedTeamId, teams]);

  const enableRealTeamQueries = !!selectedTeamId && !useMockElite;

  const {
    data: teamDetail,
    isLoading: loadingTeamDetail,
  } = useQuery({
    queryKey: ["elite-team", selectedTeamId],
    queryFn: async () => {
      const search = new URLSearchParams({
        type: "elite_team",
        teamId: String(selectedTeamId),
      });
      const res = await fetch(`/api/sports?${search.toString()}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load team");
      return json as {
        team: EliteTeamLite & { league_id?: number | null };
        coach: EliteCoachLite | null;
        players: ElitePlayerLite[];
        fetchedAt: string;
      };
    },
    enabled: enableRealTeamQueries,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const {
    data: formDetail,
    isLoading: loadingForm,
  } = useQuery({
    queryKey: ["elite-form", selectedTeamId],
    queryFn: async () => {
      const search = new URLSearchParams({
        type: "elite_form",
        teamId: String(selectedTeamId),
        n: "10",
      });
      const res = await fetch(`/api/sports?${search.toString()}`);
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load form");
      return json as {
        lastMatches: any[];
        stats: EliteFormStats;
        fetchedAt: string;
      };
    },
    enabled: enableRealTeamQueries,
    staleTime: 60 * 1000,
    retry: 1,
  });

  const isLoading =
    (!useMockElite && (loadingTeams || loadingTeamDetail || loadingForm)) ||
    (!useMockElite && !teamsData && !teamsError);

  let effectiveCoach: EliteCoachLite | null = teamDetail?.coach ?? null;
  let effectivePlayers: ElitePlayerLite[] =
    (teamDetail?.players as ElitePlayerLite[]) ?? [];
  let effectiveFormStats: EliteFormStats | null = formDetail?.stats ?? null;
  let effectiveLastMatches: any[] = formDetail?.lastMatches ?? [];
  let effectiveFetchedAt: string | null =
    formDetail?.fetchedAt ?? teamDetail?.fetchedAt ?? null;

  if (useMockElite) {
    const fallbackTeam =
      eliteTeams.find((t) => t.id === selectedTeamId) ?? eliteTeams[0];
    const mockCoach =
      eliteCoaches.find((c) => c.team === fallbackTeam?.name) ?? null;
    const mockPlayersRaw = elitePlayers.filter(
      (p) => p.country === fallbackTeam?.country,
    );

    if (fallbackTeam) {
      const trend = fallbackTeam.form_trend ?? [];
      const n = trend.length || 1;
      const wins = trend.filter((r) => r === "W").length;
      const draws = trend.filter((r) => r === "D").length;
      const losses = trend.filter((r) => r === "L").length;

      let goalsFor = 0;
      let goalsAgainst = 0;
      trend.forEach((r) => {
        if (r === "W") {
          goalsFor += 2;
          goalsAgainst += 1;
        } else if (r === "D") {
          goalsFor += 1;
          goalsAgainst += 1;
        } else if (r === "L") {
          goalsFor += 0;
          goalsAgainst += 1;
        }
      });

      const matchesCount = n;
      effectiveFormStats = {
        winRate: +((wins / matchesCount) * 100).toFixed(1),
        goalsForPerGame: +(goalsFor / matchesCount).toFixed(2),
        goalsAgainstPerGame: +(goalsAgainst / matchesCount).toFixed(2),
        cleanSheetRate: +(
          (trend.filter((r) => r === "W").length / matchesCount) *
          100
        ).toFixed(1),
        bttsRate: +(
          (trend.filter((r) => r === "W" || r === "D").length / matchesCount) *
          100
        ).toFixed(1),
      };

      effectiveLastMatches = trend.map((r, idx) => {
        const id = `mock-${fallbackTeam.id}-${idx}`;
        const opponent =
          idx % 2 === 0
            ? "Germany"
            : idx % 3 === 0
              ? "Argentina"
              : "France";
        let score = "1-1";
        if (r === "W") score = "2-1";
        else if (r === "L") score = "0-1";
        const isHome = idx % 2 === 0;
        return {
          id,
          starting_at: "",
          home: isHome ? fallbackTeam.name : opponent,
          away: isHome ? opponent : fallbackTeam.name,
          isHome,
          score,
          result: r,
        };
      });

      effectiveFetchedAt = fallbackTeam.last_updated ?? null;
    }

    effectiveCoach = mockCoach
      ? {
          id: mockCoach.id,
          name: mockCoach.name,
          nationality: mockCoach.country,
        }
      : null;

    effectivePlayers = mockPlayersRaw.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      number: null,
      image_path: p.photo_url || null,
      goals: null,
    }));
  }

  const tabContentProps = {
    teams,
    selectedTeamId,
    onSelectTeam: setSelectedTeamId,
    coach: effectiveCoach,
    players: effectivePlayers,
    formStats: effectiveFormStats,
    lastMatches: effectiveLastMatches,
    fetchedAt: effectiveFetchedAt,
  };

  const content = (
    <div className="pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              Elite Digital Twins
              <EliteBadge />
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Scout-level profiles driven by live league data from Sportmonks.
            </p>
          </div>
        </div>

        {teamsError && (
          <p className="text-xs text-signal-bearish mb-4">
            {(teamsError as any).message || "Failed to load teams."}
          </p>
        )}

        {isLoading && (
          <p className="text-xs text-muted-foreground mb-4">
            Loading Elite data…
          </p>
        )}

        <Tabs defaultValue="twin" className="mt-4">
          <TabsList className="mb-6">
            <TabsTrigger value="twin" className="text-xs font-mono">
              Digital Twin
            </TabsTrigger>
            <TabsTrigger value="radar" className="text-xs font-mono">
              Radar Analytics
            </TabsTrigger>
            <TabsTrigger value="dd" className="text-xs font-mono">
              Due Diligence
            </TabsTrigger>
          </TabsList>

          <TabsContent value="twin">
            <DigitalTwinTab {...tabContentProps} />
          </TabsContent>
          <TabsContent value="radar">
            <RadarAnalyticsTab formStats={tabContentProps.formStats} />
          </TabsContent>
          <TabsContent value="dd">
            <DueDiligenceTab
              formStats={tabContentProps.formStats}
              players={tabContentProps.players}
              fetchedAt={tabContentProps.fetchedAt}
            />
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

