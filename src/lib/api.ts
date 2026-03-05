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

