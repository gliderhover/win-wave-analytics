export type MatchContext = {
  id: number;
  leagueId: number;
  leagueName: string;
  kickoff: string;
  home: { id: number; name: string };
  away: { id: number; name: string };
};

export type FixtureLike = {
  id: string | number;
  starting_at?: string;
  league?: { id?: string | number; name?: string } | null;
  home?: { id?: string | number | null; name?: string } | null;
  away?: { id?: string | number | null; name?: string } | null;
};

export type UiFixtureLike = {
  id: string;
  leagueId?: number | null;
  leagueName?: string;
  kickoffIso?: string;
  kickoffDate?: string;
  kickoffTime?: string;
  homeTeam?: string;
  awayTeam?: string;
};

export function toMatchContext(fixture: FixtureLike): MatchContext {
  const id = Number(fixture.id);
  const league = fixture.league;
  const leagueId = league?.id != null ? Number(league.id) : 0;
  const leagueName = league?.name ?? "";
  const startingAt = fixture.starting_at ?? "";
  const dt = startingAt ? new Date(startingAt) : null;
  const kickoff =
    dt && !Number.isNaN(dt.getTime())
      ? `${dt.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} • ${dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
      : startingAt || "—";
  const home = fixture.home ?? {};
  const away = fixture.away ?? {};
  return {
    id: Number.isNaN(id) ? 0 : id,
    leagueId,
    leagueName,
    kickoff,
    home: {
      id: home.id != null ? Number(home.id) : 0,
      name: home.name ?? "",
    },
    away: {
      id: away.id != null ? Number(away.id) : 0,
      name: away.name ?? "",
    },
  };
}

export function toMatchContextFromUiFixture(ui: UiFixtureLike): MatchContext {
  const id = Number(ui.id) || 0;
  const kickoff =
    ui.kickoffDate && ui.kickoffTime
      ? `${ui.kickoffDate} • ${ui.kickoffTime}`
      : ui.kickoffIso ?? "—";
  return {
    id,
    leagueId: ui.leagueId ?? 0,
    leagueName: ui.leagueName ?? "",
    kickoff,
    home: { id: 0, name: ui.homeTeam ?? "" },
    away: { id: 0, name: ui.awayTeam ?? "" },
  };
}
