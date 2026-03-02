// TODO: Replace mock data with API calls when backend is available

export interface League {
  id: string;
  name: string;
  shortName: string;
  country: string;
  region: string;
  logo: string; // emoji placeholder
  season: string;
  active: boolean;
}

export const leagues: League[] = [
  { id: "wc", name: "FIFA World Cup", shortName: "World Cup", country: "International", region: "Global", logo: "🏆", season: "2026", active: true },
  { id: "ucl", name: "UEFA Champions League", shortName: "UCL", country: "Europe", region: "Europe", logo: "⭐", season: "2025-26", active: true },
  { id: "epl", name: "Premier League", shortName: "EPL", country: "England", region: "Europe", logo: "🦁", season: "2025-26", active: true },
  { id: "laliga", name: "La Liga", shortName: "La Liga", country: "Spain", region: "Europe", logo: "🇪🇸", season: "2025-26", active: true },
  { id: "seriea", name: "Serie A", shortName: "Serie A", country: "Italy", region: "Europe", logo: "🇮🇹", season: "2025-26", active: true },
  { id: "bundesliga", name: "Bundesliga", shortName: "Bundesliga", country: "Germany", region: "Europe", logo: "🇩🇪", season: "2025-26", active: true },
  { id: "ligue1", name: "Ligue 1", shortName: "Ligue 1", country: "France", region: "Europe", logo: "🇫🇷", season: "2025-26", active: true },
  { id: "mls", name: "Major League Soccer", shortName: "MLS", country: "USA/Canada", region: "North America", logo: "⚽", season: "2026", active: true },
];

export const getLeagueById = (id: string) => leagues.find(l => l.id === id);
export const getLeagueByName = (name: string) => leagues.find(l => l.shortName === name || l.name === name);

// Map legacy league names from scheduleData to league IDs
export const legacyLeagueMap: Record<string, string> = {
  "World Cup": "wc",
  "Qualifiers": "wc", // WC qualifiers
  "Friendlies": "wc", // international friendlies grouped under WC for now
  "Premier League": "epl",
  "La Liga": "laliga",
  "Serie A": "seriea",
  "Bundesliga": "bundesliga",
  "Ligue 1": "ligue1",
  "Champions League": "ucl",
  "MLS": "mls",
};
