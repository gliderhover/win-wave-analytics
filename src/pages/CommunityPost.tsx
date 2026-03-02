import { useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import CommentThread from "@/components/community/CommentThread";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { communityCategories, getStoredPosts, getStoredComments } from "@/lib/communityData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, ArrowBigUp, ArrowBigDown, Bookmark, Flag, Share2 } from "lucide-react";

const CommunityPostPage = () => {
  const { postId } = useParams<{ postId: string }>();
  const [commentSort, setCommentSort] = useState<"best" | "new" | "top">("best");
  const [refreshKey, setRefreshKey] = useState(0);

  const posts = useMemo(() => getStoredPosts(), []);
  const comments = useMemo(() => getStoredComments(), [refreshKey]);
  const post = posts.find(p => p.id === postId);
  const category = post ? communityCategories.find(c => c.slug === post.categorySlug) : undefined;

  const handleRefresh = useCallback(() => setRefreshKey(k => k + 1), []);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-20 px-4 text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Link to="/community" className="text-primary hover:underline text-sm mt-2 block">← Back to Community</Link>
        </div>
      </div>
    );
  }

  const netVotes = post.upvotes - post.downvotes;
  const timeAgo = getTimeAgo(post.createdAt);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          <Link to={category ? `/community/r/${category.slug}` : "/community"} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to {category ? `r/${category.slug}` : "Community"}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div>
              {/* Post content */}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex gap-4">
                  {/* Votes */}
                  <div className="flex flex-col items-center gap-0.5">
                    <button className={cn("p-1 rounded hover:bg-primary/10", post.userVote === 1 && "text-primary")}><ArrowBigUp className="w-6 h-6" /></button>
                    <span className={cn("text-sm font-mono font-bold", netVotes > 0 ? "text-primary" : "text-muted-foreground")}>{netVotes}</span>
                    <button className={cn("p-1 rounded hover:bg-destructive/10", post.userVote === -1 && "text-destructive")}><ArrowBigDown className="w-6 h-6" /></button>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      {category && (
                        <Link to={`/community/r/${category.slug}`} className="text-[10px] font-mono text-primary hover:underline">{category.emoji} r/{category.slug}</Link>
                      )}
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <Link to={`/community/profile/${post.authorId}`} className="text-[10px] text-muted-foreground hover:text-foreground">u/{post.authorName}</Link>
                      {post.authorBadges.map(b => (
                        <Badge key={b} className="text-[8px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20">{b}</Badge>
                      ))}
                      <span className="text-[10px] text-muted-foreground">• {timeAgo}</span>
                    </div>

                    <h1 className="text-lg font-bold text-foreground mb-3">{post.title}</h1>

                    <div className="prose prose-sm prose-invert max-w-none text-foreground/90 text-sm leading-relaxed whitespace-pre-wrap">
                      {post.body}
                    </div>

                    {/* Poll */}
                    {post.pollQuestion && post.pollOptions && (
                      <div className="mt-4 p-3 rounded-lg bg-secondary/50 border border-border">
                        <p className="text-xs font-semibold text-foreground mb-2">📊 {post.pollQuestion}</p>
                        <div className="space-y-1.5">
                          {post.pollOptions.map((opt, i) => {
                            const total = post.pollOptions!.reduce((s, o) => s + o.votes, 0);
                            const pct = total > 0 ? (opt.votes / total * 100).toFixed(0) : "0";
                            return (
                              <div key={i} className="relative rounded overflow-hidden bg-secondary h-7 flex items-center">
                                <div className="absolute inset-y-0 left-0 bg-primary/20 rounded" style={{ width: `${pct}%` }} />
                                <span className="relative z-10 text-[11px] font-mono px-2 text-foreground">{opt.label}</span>
                                <span className="relative z-10 text-[11px] font-mono ml-auto px-2 text-muted-foreground">{opt.votes} ({pct}%)</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {post.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap mt-4">
                        {post.tags.map(tag => (
                          <span key={tag} className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border">
                      <span className="text-[11px] text-muted-foreground">{post.commentCount} comments</span>
                      <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><Share2 className="w-3.5 h-3.5" /> Share</button>
                      <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><Bookmark className="w-3.5 h-3.5" /> Save</button>
                      <button className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"><Flag className="w-3.5 h-3.5" /> Report</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comment sort */}
              <div className="flex items-center gap-2 mt-6 mb-3">
                <span className="text-xs text-muted-foreground">Sort by:</span>
                {(["best", "new", "top"] as const).map(s => (
                  <button
                    key={s}
                    onClick={() => setCommentSort(s)}
                    className={cn("text-[10px] font-mono px-2 py-0.5 rounded", commentSort === s ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground")}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </button>
                ))}
              </div>

              {/* Comments */}
              <CommentThread comments={comments} postId={post.id} onRefresh={handleRefresh} sortMode={commentSort} />
            </div>

            <div className="hidden lg:block">
              <CommunitySidebar category={category} posts={posts} comments={comments} />
            </div>
          </div>
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

export default CommunityPostPage;
