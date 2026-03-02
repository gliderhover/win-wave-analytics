// ─── Types ────────────────────────────────────────────────────────────────────

export interface CommunityCategory {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  description: string;
  parent?: string;
  followers: number;
  rules: string;
}

export type PostType = "discussion" | "match_thread" | "analysis" | "highlight";
export type SortMode = "hot" | "new" | "top_24h" | "top_week" | "top_month" | "top_all";
export type ReportReason = "off_topic" | "spam" | "harassment" | "misinformation" | "other";

export interface CommunityPost {
  id: string;
  type: PostType;
  title: string;
  body: string;
  authorId: string;
  authorName: string;
  authorReputation: number;
  authorBadges: string[];
  categorySlug: string;
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  matchId?: string;
  pollQuestion?: string;
  pollOptions?: { label: string; votes: number }[];
  reported: boolean;
  reportReasons: ReportReason[];
  modStatus: "approved" | "pending" | "removed";
  saved?: boolean;
  userVote?: 1 | -1 | 0;
}

export interface CommunityComment {
  id: string;
  postId: string;
  parentId?: string;
  authorId: string;
  authorName: string;
  authorReputation: number;
  body: string;
  upvotes: number;
  downvotes: number;
  createdAt: string;
  reported: boolean;
  reportReasons: ReportReason[];
  userVote?: 1 | -1 | 0;
}

export interface CommunityUser {
  id: string;
  name: string;
  reputation: number;
  badges: string[];
  joinedAt: string;
  postCount: number;
  commentCount: number;
}

// ─── Sports keywords for relevance check ──────────────────────────────────────

const SPORTS_KEYWORDS = [
  "goal", "match", "league", "team", "player", "coach", "transfer", "injury",
  "tactics", "formation", "referee", "penalty", "offside", "foul", "card",
  "corner", "assist", "striker", "midfielder", "defender", "goalkeeper",
  "champions", "world cup", "premier", "serie a", "bundesliga", "la liga",
  "ligue 1", "mls", "ucl", "epl", "football", "soccer", "basketball",
  "tennis", "baseball", "nfl", "esports", "betting", "odds", "edge",
  "analytics", "prediction", "lineup", "substitution", "half-time", "halftime",
  "score", "draw", "win", "loss", "hat trick", "hat-trick", "clean sheet",
  "relegation", "promotion", "derby", "kickoff", "kick-off", "fixture",
  "standings", "table", "points", "season", "trophy", "final", "semi-final",
  "quarter-final", "group stage", "qualifiers", "friendly", "cap", "squad",
  "bench", "starting xi", "var", "handball", "free kick", "freekick",
  "cross", "header", "volley", "dribble", "tackle", "press", "counter",
  "possession", "xg", "expected goals", "shot", "save", "block",
  "fantasy", "draft", "roster", "training", "fitness", "red card", "yellow card",
  "highlight", "replay", "stadium", "pitch", "sport", "athlete", "game",
  "playoff", "bracket", "tournament", "championship", "medal", "record",
  "stats", "statistics", "performance", "ranking", "seeding", "division",
  "conference", "franchise", "trade", "signing", "contract", "loan",
  "manager", "bench", "dugout", "touchline", "simulation", "paper bet"
];

export function checkSportsRelevance(title: string, body: string): { relevant: boolean; score: number } {
  const text = `${title} ${body}`.toLowerCase();
  let hits = 0;
  for (const kw of SPORTS_KEYWORDS) {
    if (text.includes(kw)) hits++;
  }
  const score = Math.min(hits / 3, 1); // 3+ keywords = fully relevant
  return { relevant: score >= 0.33, score };
}

// ─── Profanity filter (lightweight) ───────────────────────────────────────────

const BLOCKED_WORDS = ["fuck", "shit", "damn", "bitch", "asshole", "bastard", "crap"];

export function filterProfanity(text: string): string {
  let result = text;
  for (const w of BLOCKED_WORDS) {
    const regex = new RegExp(`\\b${w}\\b`, "gi");
    result = result.replace(regex, "*".repeat(w.length));
  }
  return result;
}

// ─── Default categories ───────────────────────────────────────────────────────

export const communityCategories: CommunityCategory[] = [
  { id: "soccer", slug: "soccer", name: "Soccer", emoji: "⚽", description: "Global football discussion", followers: 284500, rules: "Keep it about the beautiful game." },
  { id: "world-cup", slug: "world-cup", name: "World Cup", emoji: "🏆", description: "FIFA World Cup talk", parent: "soccer", followers: 192000, rules: "World Cup matches, history, and predictions." },
  { id: "ucl", slug: "champions-league", name: "Champions League", emoji: "🌟", description: "UEFA Champions League", parent: "soccer", followers: 156000, rules: "UCL matches and analysis." },
  { id: "epl", slug: "premier-league", name: "Premier League", emoji: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", description: "English Premier League", parent: "soccer", followers: 210000, rules: "EPL news, results, and discussion." },
  { id: "laliga", slug: "la-liga", name: "La Liga", emoji: "🇪🇸", description: "Spanish La Liga", parent: "soccer", followers: 134000, rules: "La Liga discussion." },
  { id: "seriea", slug: "serie-a", name: "Serie A", emoji: "🇮🇹", description: "Italian Serie A", parent: "soccer", followers: 98000, rules: "Serie A talk." },
  { id: "bundesliga", slug: "bundesliga", name: "Bundesliga", emoji: "🇩🇪", description: "German Bundesliga", parent: "soccer", followers: 87000, rules: "Bundesliga discussion." },
  { id: "ligue1", slug: "ligue-1", name: "Ligue 1", emoji: "🇫🇷", description: "French Ligue 1", parent: "soccer", followers: 62000, rules: "Ligue 1 talk." },
  { id: "mls", slug: "mls", name: "MLS", emoji: "🇺🇸", description: "Major League Soccer", parent: "soccer", followers: 54000, rules: "MLS discussion." },
  { id: "basketball", slug: "basketball", name: "Basketball", emoji: "🏀", description: "NBA, EuroLeague, and more", followers: 175000, rules: "Basketball discussion." },
  { id: "esports", slug: "esports", name: "Esports", emoji: "🎮", description: "Competitive gaming", followers: 120000, rules: "Esports discussion." },
  { id: "tennis", slug: "tennis", name: "Tennis", emoji: "🎾", description: "ATP, WTA, Grand Slams", followers: 88000, rules: "Tennis talk." },
  { id: "baseball", slug: "baseball", name: "Baseball", emoji: "⚾", description: "MLB and international", followers: 65000, rules: "Baseball discussion." },
  { id: "nfl", slug: "nfl", name: "NFL", emoji: "🏈", description: "American football", followers: 190000, rules: "NFL talk." },
  { id: "analytics", slug: "analytics-tactics", name: "Analytics & Tactics", emoji: "📊", description: "Data-driven sports analysis", followers: 45000, rules: "Share models, tactics, and analytical breakdowns." },
  { id: "simulation", slug: "betting-simulation", name: "Betting Simulation", emoji: "🎰", description: "Paper betting discussion only — no real money", followers: 32000, rules: "Simulation and paper betting strategy. No real-money promotion." },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUsers: CommunityUser[] = [
  { id: "u1", name: "TacticsNerd42", reputation: 2450, badges: ["Tactics Nerd", "Top Analyst"], joinedAt: "2024-03-15", postCount: 87, commentCount: 412 },
  { id: "u2", name: "GoalMachine_", reputation: 1820, badges: ["Match Thread Host"], joinedAt: "2024-06-01", postCount: 54, commentCount: 298 },
  { id: "u3", name: "EdgeHunter", reputation: 3100, badges: ["Top Analyst", "Transfer Insider"], joinedAt: "2024-01-10", postCount: 123, commentCount: 567 },
  { id: "u4", name: "PitchSideView", reputation: 980, badges: [], joinedAt: "2025-01-20", postCount: 22, commentCount: 145 },
  { id: "u5", name: "DataDrivenFan", reputation: 1560, badges: ["Tactics Nerd"], joinedAt: "2024-09-05", postCount: 45, commentCount: 231 },
  { id: "u6", name: "MatchDayVibes", reputation: 720, badges: ["Match Thread Host"], joinedAt: "2025-06-12", postCount: 18, commentCount: 89 },
];

export const mockPosts: CommunityPost[] = [
  {
    id: "p1", type: "analysis", title: "xG Model Shows Arsenal's Finishing Is Unsustainable",
    body: "Looking at the underlying numbers, Arsenal have been overperforming their xG by 0.8 goals per match over the last 10 games. Here's a breakdown of why this regression is coming...\n\n## Key Findings\n- Shot quality has decreased 12% since GW20\n- Saka's conversion rate is 2x above career average\n- Historical teams with similar profiles regressed within 5-8 matches\n\nThis suggests value in **Under 2.5** for upcoming fixtures.",
    authorId: "u3", authorName: "EdgeHunter", authorReputation: 3100, authorBadges: ["Top Analyst"],
    categorySlug: "premier-league", tags: ["Arsenal", "EPL", "xG", "Analytics"],
    upvotes: 342, downvotes: 28, commentCount: 67, createdAt: "2026-03-01T14:30:00Z",
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p2", type: "match_thread", title: "🔴 MATCH THREAD: Brazil vs Germany — World Cup QF",
    body: "It's happening again! Brazil face Germany in the quarter-finals.\n\n**Kickoff:** 20:00 UTC\n**Venue:** Lusail Stadium\n**Referee:** TBD\n\nLineups, live updates, and discussion below. Keep it civil!",
    authorId: "u2", authorName: "GoalMachine_", authorReputation: 1820, authorBadges: ["Match Thread Host"],
    categorySlug: "world-cup", tags: ["Brazil", "Germany", "World Cup", "Quarter-Final"],
    upvotes: 891, downvotes: 12, commentCount: 234, createdAt: "2026-03-02T10:00:00Z",
    matchId: "m1", pollQuestion: "Who advances?", pollOptions: [{ label: "Brazil", votes: 456 }, { label: "Germany", votes: 389 }, { label: "Draw (ET/Pens)", votes: 201 }],
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p3", type: "discussion", title: "Why Guardiola's 3-2-4-1 Is Breaking the Meta",
    body: "Pep's latest formation tweak has created fascinating tactical problems for opponents. The inverted fullbacks create a double pivot in buildup while the width comes from...\n\nWhat do you think — is this sustainable against high-pressing teams?",
    authorId: "u1", authorName: "TacticsNerd42", authorReputation: 2450, authorBadges: ["Tactics Nerd"],
    categorySlug: "premier-league", tags: ["Man City", "Tactics", "Guardiola", "Formation"],
    upvotes: 567, downvotes: 45, commentCount: 89, createdAt: "2026-03-01T09:15:00Z",
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p4", type: "highlight", title: "Vinícius Jr. solo goal vs Bayern — UCL Semi",
    body: "https://example.com/highlights/vini-goal\n\nAbsolutely insane dribble past 3 defenders. Reminiscent of R9 in his prime. The acceleration and close control here is world-class.",
    authorId: "u6", authorName: "MatchDayVibes", authorReputation: 720, authorBadges: ["Match Thread Host"],
    categorySlug: "champions-league", tags: ["Real Madrid", "Vinícius Jr", "UCL", "Highlights"],
    upvotes: 1203, downvotes: 34, commentCount: 156, createdAt: "2026-02-28T22:45:00Z",
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p5", type: "discussion", title: "Paper Betting Strategy: Kelly Criterion vs Flat Staking",
    body: "I've been running both systems in the simulator for 3 months now. Here are my results:\n\n- Kelly: +18.4% ROI, MaxDD -22%\n- Flat 2%: +11.2% ROI, MaxDD -8%\n\nKelly gives higher returns but the drawdowns are brutal. What's everyone else using?",
    authorId: "u5", authorName: "DataDrivenFan", authorReputation: 1560, authorBadges: ["Tactics Nerd"],
    categorySlug: "betting-simulation", tags: ["Strategy", "Kelly Criterion", "Simulation", "Bankroll"],
    upvotes: 189, downvotes: 8, commentCount: 43, createdAt: "2026-03-01T16:20:00Z",
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p6", type: "analysis", title: "Transfer Impact: How Salah's Move Changes Liverpool's xG Distribution",
    body: "With the Salah transfer confirmed, I ran the numbers on how Liverpool's attacking output shifts...\n\n## Before vs After Projection\n- Right-wing xG contribution drops from 0.45 to 0.28 per match\n- Central channels must absorb 60% of the creative burden\n\nThis is a massive market inefficiency for the first 5-10 matches.",
    authorId: "u3", authorName: "EdgeHunter", authorReputation: 3100, authorBadges: ["Top Analyst", "Transfer Insider"],
    categorySlug: "premier-league", tags: ["Liverpool", "Salah", "Transfer", "xG"],
    upvotes: 478, downvotes: 31, commentCount: 92, createdAt: "2026-02-27T11:00:00Z",
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p7", type: "match_thread", title: "🏀 GAME THREAD: Lakers vs Celtics — NBA Finals G7",
    body: "The ultimate rivalry. Winner takes it all.\n\n**Tip-off:** 21:00 ET\n**TV:** ABC\n\nLet's go!",
    authorId: "u2", authorName: "GoalMachine_", authorReputation: 1820, authorBadges: ["Match Thread Host"],
    categorySlug: "basketball", tags: ["Lakers", "Celtics", "NBA Finals"],
    upvotes: 654, downvotes: 15, commentCount: 312, createdAt: "2026-02-26T20:00:00Z",
    reported: false, reportReasons: [], modStatus: "approved",
  },
  {
    id: "p8", type: "discussion", title: "Reported: Off-topic political rant",
    body: "This is test content that has been reported.",
    authorId: "u4", authorName: "PitchSideView", authorReputation: 980, authorBadges: [],
    categorySlug: "soccer", tags: [],
    upvotes: 2, downvotes: 45, commentCount: 3, createdAt: "2026-03-01T08:00:00Z",
    reported: true, reportReasons: ["off_topic", "spam"], modStatus: "pending",
  },
];

export const mockComments: CommunityComment[] = [
  { id: "c1", postId: "p1", authorId: "u1", authorName: "TacticsNerd42", authorReputation: 2450, body: "Great analysis. The xG data is really compelling here. I'd also add that their set-piece conversion has been unusually high.", upvotes: 89, downvotes: 3, createdAt: "2026-03-01T15:00:00Z", reported: false, reportReasons: [] },
  { id: "c2", postId: "p1", parentId: "c1", authorId: "u3", authorName: "EdgeHunter", authorReputation: 3100, body: "Good point — their set-piece xG is 0.32 vs an expected 0.18. That's another regression candidate.", upvotes: 56, downvotes: 1, createdAt: "2026-03-01T15:15:00Z", reported: false, reportReasons: [] },
  { id: "c3", postId: "p1", authorId: "u5", authorName: "DataDrivenFan", authorReputation: 1560, body: "Counterpoint: Saka's technique has genuinely improved. Not all overperformance is random.", upvotes: 34, downvotes: 12, createdAt: "2026-03-01T15:30:00Z", reported: false, reportReasons: [] },
  { id: "c4", postId: "p1", parentId: "c3", authorId: "u4", authorName: "PitchSideView", authorReputation: 980, body: "Yeah but even elite finishers regress. The question is *how much*, not *if*.", upvotes: 22, downvotes: 2, createdAt: "2026-03-01T16:00:00Z", reported: false, reportReasons: [] },
  { id: "c5", postId: "p2", authorId: "u1", authorName: "TacticsNerd42", authorReputation: 2450, body: "Brazil's midfield pivot is key. If they can bypass Germany's press through Paquetá, it's over.", upvotes: 123, downvotes: 5, createdAt: "2026-03-02T10:30:00Z", reported: false, reportReasons: [] },
  { id: "c6", postId: "p2", authorId: "u5", authorName: "DataDrivenFan", authorReputation: 1560, body: "Germany's set-piece defense has been poor this tournament. Brazil should target that.", upvotes: 67, downvotes: 2, createdAt: "2026-03-02T11:00:00Z", reported: false, reportReasons: [] },
  { id: "c7", postId: "p3", authorId: "u3", authorName: "EdgeHunter", authorReputation: 3100, body: "The inverted fullback role only works if you have players with the technical quality. Not every team can replicate this.", upvotes: 78, downvotes: 4, createdAt: "2026-03-01T10:00:00Z", reported: false, reportReasons: [] },
  { id: "c8", postId: "p5", authorId: "u1", authorName: "TacticsNerd42", authorReputation: 2450, body: "I use a fractional Kelly (0.25x) which gives me the best of both worlds. Recommended reading: the paper by Thorp on optimal sizing.", upvotes: 45, downvotes: 0, createdAt: "2026-03-01T17:00:00Z", reported: false, reportReasons: [] },
];

export { mockUsers };

// ─── localStorage helpers ─────────────────────────────────────────────────────

const POSTS_KEY = "betiq_community_posts";
const COMMENTS_KEY = "betiq_community_comments";

export function getStoredPosts(): CommunityPost[] {
  try {
    const stored = localStorage.getItem(POSTS_KEY);
    if (stored) return [...JSON.parse(stored), ...mockPosts];
  } catch {}
  return [...mockPosts];
}

export function savePost(post: CommunityPost) {
  try {
    const stored = localStorage.getItem(POSTS_KEY);
    const posts: CommunityPost[] = stored ? JSON.parse(stored) : [];
    posts.unshift(post);
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  } catch {}
}

export function getStoredComments(): CommunityComment[] {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    if (stored) return [...JSON.parse(stored), ...mockComments];
  } catch {}
  return [...mockComments];
}

export function saveComment(comment: CommunityComment) {
  try {
    const stored = localStorage.getItem(COMMENTS_KEY);
    const comments: CommunityComment[] = stored ? JSON.parse(stored) : [];
    comments.unshift(comment);
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(comments));
  } catch {}
}

// ─── Sorting helpers ──────────────────────────────────────────────────────────

export function sortPosts(posts: CommunityPost[], mode: SortMode): CommunityPost[] {
  const now = Date.now();
  const sorted = [...posts];
  switch (mode) {
    case "hot":
      return sorted.sort((a, b) => {
        const scoreA = (a.upvotes - a.downvotes) / Math.pow((now - new Date(a.createdAt).getTime()) / 3600000 + 2, 1.5);
        const scoreB = (b.upvotes - b.downvotes) / Math.pow((now - new Date(b.createdAt).getTime()) / 3600000 + 2, 1.5);
        return scoreB - scoreA;
      });
    case "new":
      return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "top_24h":
      return sorted.filter(p => now - new Date(p.createdAt).getTime() < 86400000).sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    case "top_week":
      return sorted.filter(p => now - new Date(p.createdAt).getTime() < 604800000).sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    case "top_month":
      return sorted.filter(p => now - new Date(p.createdAt).getTime() < 2592000000).sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    case "top_all":
      return sorted.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    default:
      return sorted;
  }
}

// ─── Trending tags ────────────────────────────────────────────────────────────

export function getTrendingTags(posts: CommunityPost[]): { tag: string; count: number }[] {
  const tagMap = new Map<string, number>();
  for (const p of posts) {
    for (const t of p.tags) {
      tagMap.set(t, (tagMap.get(t) || 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export function getTopContributors(posts: CommunityPost[], comments: CommunityComment[]): { name: string; reputation: number; badges: string[] }[] {
  const map = new Map<string, { name: string; reputation: number; badges: string[]; score: number }>();
  for (const p of posts) {
    const existing = map.get(p.authorId);
    if (existing) {
      existing.score += p.upvotes - p.downvotes;
    } else {
      map.set(p.authorId, { name: p.authorName, reputation: p.authorReputation, badges: p.authorBadges, score: p.upvotes - p.downvotes });
    }
  }
  for (const c of comments) {
    const existing = map.get(c.authorId);
    if (existing) {
      existing.score += c.upvotes - c.downvotes;
    } else {
      map.set(c.authorId, { name: c.authorName, reputation: c.authorReputation, badges: [], score: c.upvotes - c.downvotes });
    }
  }
  return Array.from(map.values()).sort((a, b) => b.score - a.score).slice(0, 5);
}
