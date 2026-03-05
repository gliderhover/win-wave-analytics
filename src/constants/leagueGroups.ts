export interface LeagueGroupItem {
  id: number;
  name: string;
}

/** Leagues supported by current key with real fixtures. */
export const FEATURED_NOW_LEAGUES: LeagueGroupItem[] = [
  { id: 779, name: "Major League Soccer (MLS)" },
  { id: 8, name: "Premier League (EPL)" },
  { id: 24, name: "FA Cup" },
  { id: 301, name: "Ligue 1" },
  { id: 304, name: "Ligue 2" },
  { id: 82, name: "Bundesliga" },
  { id: 384, name: "Serie A" },
  { id: 72, name: "Eredivisie" },
  { id: 1122, name: "Copa Libertadores" },
  { id: 564, name: "La Liga" },
];

/** Leagues for branding; schedule may not be available yet. */
export const UPCOMING_SOON_LEAGUES: LeagueGroupItem[] = [
  { id: 732, name: "World Cup" },
  { id: 2, name: "UEFA Champions League" },
  { id: 5, name: "Europa League" },
];

/** First 6 FeaturedNow + World Cup (732) for homepage single API call. */
export const HOMEPAGE_FEATURED_IDS: number[] = [
  FEATURED_NOW_LEAGUES[0].id, // MLS 779
  FEATURED_NOW_LEAGUES[1].id, // EPL 8
  FEATURED_NOW_LEAGUES[2].id, // FA Cup 24
  FEATURED_NOW_LEAGUES[3].id, // Ligue 1 301
  FEATURED_NOW_LEAGUES[4].id, // Ligue 2 304
  FEATURED_NOW_LEAGUES[5].id, // Bundesliga 82
  732, // World Cup
];

export const HOMEPAGE_FEATURED_IDS_STR = HOMEPAGE_FEATURED_IDS.join(",");

/** Lookup by id from FeaturedNow + UpcomingSoon for display names. */
export function getLeagueNameById(id: number): string {
  const f = FEATURED_NOW_LEAGUES.find((l) => l.id === id);
  if (f) return f.name;
  const u = UPCOMING_SOON_LEAGUES.find((l) => l.id === id);
  return u?.name ?? `League ${id}`;
}
