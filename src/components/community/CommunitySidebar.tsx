import { Link } from "react-router-dom";
import { Shield, TrendingUp, Trophy, Users } from "lucide-react";
import { CommunityCategory, CommunityPost, CommunityComment, getTrendingTags, getTopContributors } from "@/lib/communityData";

interface CommunitySidebarProps {
  category?: CommunityCategory;
  posts: CommunityPost[];
  comments: CommunityComment[];
}

const CommunitySidebar = ({ category, posts, comments }: CommunitySidebarProps) => {
  const trending = getTrendingTags(posts);
  const topContributors = getTopContributors(posts, comments);

  return (
    <div className="space-y-4">
      {/* Rules */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">Community Rules</h3>
        </div>
        <div className="text-[11px] text-muted-foreground space-y-2">
          <p className="font-semibold text-primary">🏟️ Sports-only community</p>
          <div>
            <p className="font-medium text-foreground mb-1">✅ Allowed:</p>
            <p>Matches, leagues, players, tactics, coaching, training, injuries, transfers, fantasy, analytics, betting strategy (simulation only), sports culture.</p>
          </div>
          <div>
            <p className="font-medium text-destructive mb-1">❌ Not allowed:</p>
            <p>Politics, hate/harassment, sexual content, illegal activity, personal info, non-sports promotions/spam.</p>
          </div>
          {category && <p className="border-t border-border pt-2 mt-2">{category.rules}</p>}
        </div>
        <Link to="/community/guidelines" className="text-[10px] text-primary hover:underline mt-2 block">Full community guidelines →</Link>
      </div>

      {/* Trending */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">Trending Topics</h3>
        </div>
        <div className="space-y-1.5">
          {trending.map(({ tag, count }) => (
            <div key={tag} className="flex items-center justify-between">
              <span className="text-[11px] text-foreground">#{tag}</span>
              <span className="text-[10px] font-mono text-muted-foreground">{count} posts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Contributors */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-semibold text-foreground">Top Contributors (Weekly)</h3>
        </div>
        <div className="space-y-2">
          {topContributors.map((user, i) => (
            <div key={user.name} className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-muted-foreground w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-foreground">{user.name}</span>
                {user.badges.length > 0 && (
                  <span className="text-[9px] text-primary ml-1">{user.badges[0]}</span>
                )}
              </div>
              <span className="text-[10px] font-mono text-primary">⭐ {user.reputation}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create post CTA */}
      <Link
        to="/community/new"
        className="block text-center text-sm font-semibold gradient-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
      >
        <Users className="w-4 h-4 inline mr-1.5" />
        Create Post
      </Link>
    </div>
  );
};

export default CommunitySidebar;
