export interface UiFixture {
  id: string;
  leagueId: number | null;
  leagueName: string;
  homeTeam: string;
  awayTeam: string;
  kickoffIso: string;
  kickoffDate: string;
  kickoffTime: string;
}

export interface UiLeagueOption {
  id: string;
  name: string;
}

export interface League {
  id: string;
  name: string;
  image_path?: string;
  country_id?: number | null;
  short_code?: string | null;
  active?: boolean;
  last_played_at?: string | null;
}

export interface Fixture {
  id: string;
  starting_at: string;
  state_id: number | null;
  league: {
    id: string;
    name: string;
  };
  home: {
    id: string | null;
    name: string;
  };
  away: {
    id: string | null;
    name: string;
  };
}

interface FixturesParams {
  leagueIds?: string;
  all?: boolean;
  days?: number;
}

interface FixturesResponse {
  fixtures: UiFixture[];
  count: number;
}

interface AvailableLeaguesResponse {
  leagues: UiLeagueOption[];
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Request failed");
  }
  return res.json() as Promise<T>;
}

export async function fetchFixtures(params: FixturesParams): Promise<FixturesResponse> {
  const search = new URLSearchParams();
  const days = params.days ?? 30;
  search.set("days", String(days));
  if (params.all) {
    search.set("all", "true");
  } else if (params.leagueIds) {
    search.set("leagueIds", params.leagueIds);
  } else {
    search.set("all", "true");
  }

  const data = await fetchJson<{
    ok: boolean;
    count: number;
    fixtures: {
      id: number | string;
      starting_at: string;
      league: { id: number; name: string; season_id: number | null } | null;
      home: { id: number; name: string } | null;
      away: { id: number; name: string } | null;
    }[];
  }>(`/api/fixtures?${search.toString()}`);

  const fixtures: UiFixture[] = (data.fixtures ?? []).map((f) => {
    const iso = f.starting_at;
    const dt = iso ? new Date(iso) : null;
    const kickoffDate = dt
      ? dt.toLocaleDateString(undefined, { month: "short", day: "numeric" })
      : "";
    const kickoffTime = dt
      ? dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      : "";

    return {
      id: String(f.id),
      leagueId: f.league?.id ?? null,
      leagueName: f.league?.name ?? "",
      homeTeam: f.home?.name ?? "",
      awayTeam: f.away?.name ?? "",
      kickoffIso: iso,
      kickoffDate,
      kickoffTime,
    };
  });

  return {
    fixtures,
    count: data.count ?? fixtures.length,
  };
}

export async function fetchAvailableLeagues(params: { days?: number } = {}): Promise<AvailableLeaguesResponse> {
  const days = params.days ?? 90;
  const search = new URLSearchParams({ days: String(days) });
  const data = await fetchJson<{
    leagues: { id: number; name: string; countUpcoming: number }[];
  }>(`/api/leagues/available?${search.toString()}`);

  const leagues: UiLeagueOption[] = (data.leagues ?? []).map((l) => ({
    id: String(l.id),
    name: l.name ?? "",
  }));

  return { leagues };
}

// New helpers for league/fixtures flows

export async function getAvailableLeagues(days = 90): Promise<League[]> {
  const search = new URLSearchParams({ days: String(days) });
  const data = await fetchJson<{
    leagues: { id: number; name: string; countUpcoming: number }[];
  }>(`/api/leagues/available?${search.toString()}`);

  return (data.leagues ?? []).map((l) => ({
    id: String(l.id),
    name: l.name ?? "",
  }));
}

export async function getFixtures(params: { leagueId: string; days?: number }): Promise<Fixture[]> {
  const search = new URLSearchParams();
  search.set("leagueIds", params.leagueId);
  search.set("days", String(params.days ?? 30));

  const data = await fetchJson<{
    ok: boolean;
    count: number;
    fixtures: {
      id: number | string;
      starting_at: string;
      state_id: number | null;
      league: { id: number; name: string } | null;
      home: { id: number; name: string } | null;
      away: { id: number; name: string } | null;
    }[];
  }>(`/api/fixtures?${search.toString()}`);

  if (!data.ok) {
    throw new Error("Failed to load fixtures");
  }

  return (data.fixtures ?? []).map((f) => ({
    id: String(f.id),
    starting_at: f.starting_at,
    state_id: f.state_id ?? null,
    league: {
      id: f.league ? String(f.league.id) : "",
      name: f.league?.name ?? "",
    },
    home: {
      id: f.home ? String(f.home.id) : null,
      name: f.home?.name ?? "",
    },
    away: {
      id: f.away ? String(f.away.id) : null,
      name: f.away?.name ?? "",
    },
  }));
}

export async function getLeagueInfo(leagueId: string): Promise<League> {
  const search = new URLSearchParams({ id: leagueId });
  const data = await fetchJson<{
    ok: boolean;
    league: {
      id: number;
      name: string;
      image_path?: string;
      country_id?: number | null;
      short_code?: string | null;
      active?: boolean;
      last_played_at?: string | null;
    } | null;
  }>(`/api/league?${search.toString()}`);

  if (!data.ok || !data.league) {
    throw new Error("Failed to load league info");
  }

  return {
    id: String(data.league.id),
    name: data.league.name ?? "",
    image_path: data.league.image_path,
    country_id: data.league.country_id ?? null,
    short_code: data.league.short_code ?? null,
    active: data.league.active,
    last_played_at: data.league.last_played_at ?? null,
  };
}

export interface SingleFixtureResponse {
  id: string;
  starting_at: string;
  state_id: number | null;
  league: { id: number; name: string; season_id: number | null };
  home: { id: number; name: string } | null;
  away: { id: number; name: string } | null;
}

export async function getFixture(fixtureId: string): Promise<SingleFixtureResponse> {
  const search = new URLSearchParams({ id: fixtureId });
  const data = await fetchJson<{
    ok: boolean;
    fixture: {
      id: number | string;
      starting_at: string;
      state_id: number | null;
      league: { id: number; name: string; season_id: number | null };
      home: { id: number; name: string } | null;
      away: { id: number; name: string } | null;
    };
  }>(`/api/fixture?${search.toString()}`);

  if (!data.ok || !data.fixture) {
    throw new Error("Failed to load fixture");
  }

  const f = data.fixture;
  return {
    id: String(f.id),
    starting_at: f.starting_at,
    state_id: f.state_id ?? null,
    league: f.league ?? { id: 0, name: "", season_id: null },
    home: f.home ?? null,
    away: f.away ?? null,
  };
}


