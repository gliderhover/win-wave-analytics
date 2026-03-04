import { Link } from "react-router-dom";
import { ArrowBigUp, ArrowBigDown, MessageSquare, Bookmark, Flag, BarChart3, Newspaper, LinkIcon, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CommunityPost, communityCategories } from "@/lib/communityData";

const typeIcons: Record<string, React.ReactNode> = {
  discussion: <MessageCircle className="w-3.5 h-3.5" />,
  match_thread: <BarChart3 className="w-3.5 h-3.5" />,
  analysis: <Newspaper className="w-3.5 h-3.5" />,
  highlight: <LinkIcon className="w-3.5 h-3.5" />,
};

const typeLabels: Record<string, string> = {
  discussion: "Discussion",
  match_thread: "Match Thread",
  analysis: "Analysis",
  highlight: "Highlight",
};

interface PostCardProps {
  post: CommunityPost;
  onVote?: (postId: string, dir: 1 | -1) => void;
  onSave?: (postId: string) => void;
  onReport?: (postId: string) => void;
}

const PostCard = ({ post, onVote, onSave, onReport }: PostCardProps) => {
  const category = communityCategories.find(c => c.slug === post.categorySlug);
  const netVotes = post.upvotes - post.downvotes;
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className="flex gap-3 p-4 rounded-lg border border-border bg-card hover:border-primary/20 transition-colors">
      {/* Vote column */}
      <div className="flex flex-col items-center gap-0.5 min-w-[40px]">
        <button
          onClick={() => onVote?.(post.id, 1)}
          className={cn("p-1 rounded hover:bg-primary/10 transition-colors", post.userVote === 1 && "text-primary")}
        >
          <ArrowBigUp className="w-5 h-5" />
        </button>
        <span className={cn("text-sm font-mono font-semibold", netVotes > 0 ? "text-primary" : netVotes < 0 ? "text-destructive" : "text-muted-foreground")}>
          {netVotes > 999 ? `${(netVotes / 1000).toFixed(1)}k` : netVotes}
        </span>
        <button
          onClick={() => onVote?.(post.id, -1)}
          className={cn("p-1 rounded hover:bg-destructive/10 transition-colors", post.userVote === -1 && "text-destructive")}
        >
          <ArrowBigDown className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          {category && (
            <Link to={`/community/r/${category.slug}`} className="text-[10px] font-mono text-primary hover:underline">
              {category.emoji} r/{category.slug}
            </Link>
          )}
          <span className="text-[10px] text-muted-foreground">•</span>
          <Link to={`/community/profile/${post.authorId}`} className="text-[10px] text-muted-foreground hover:text-foreground">
            u/{post.authorName}
          </Link>
          {post.authorReputation > 2000 && (
            <span className="text-[9px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded">⭐ {post.authorReputation}</span>
          )}
          <span className="text-[10px] text-muted-foreground">• {timeAgo}</span>
          <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 gap-1">
            {typeIcons[post.type]}
            {typeLabels[post.type]}
          </Badge>
        </div>

        <Link to={`/community/post/${post.id}`} className="block">
          <h3 className="text-sm font-semibold text-foreground hover:text-primary transition-colors leading-snug mb-1">
            {post.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{post.body.slice(0, 200)}</p>
        </Link>

        {/* Poll preview */}
        {post.pollQuestion && post.pollOptions && (
          <div className="mt-2 p-2 rounded bg-secondary/50 border border-border">
            <p className="text-[10px] font-mono text-muted-foreground mb-1">📊 {post.pollQuestion}</p>
            <div className="flex gap-2 flex-wrap">
              {post.pollOptions.map((opt, i) => (
                <span key={i} className="text-[10px] font-mono text-foreground bg-secondary px-2 py-0.5 rounded">
                  {opt.label}: {opt.votes}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex gap-1 flex-wrap mt-2">
            {post.tags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{tag}</span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2">
          <Link to={`/community/post/${post.id}`} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <MessageSquare className="w-3.5 h-3.5" />
            {post.commentCount} comments
          </Link>
          <button onClick={() => onSave?.(post.id)} className={cn("flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors", post.saved && "text-primary")}>
            <Bookmark className="w-3.5 h-3.5" />
            Save
          </button>
          <button onClick={() => onReport?.(post.id)} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
            <Flag className="w-3.5 h-3.5" />
            Report
          </button>
        </div>
      </div>
    </div>
  );
};

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default PostCard;
