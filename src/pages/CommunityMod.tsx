import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { getStoredPosts, getStoredComments, communityCategories, type ReportReason } from "@/lib/communityData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowLeft, Shield, Check, X, Eye } from "lucide-react";

const reasonLabels: Record<ReportReason, string> = {
  off_topic: "Off-topic",
  spam: "Spam",
  harassment: "Harassment",
  misinformation: "Misinformation",
  other: "Other",
};

const CommunityMod = () => {
  const [filter, setFilter] = useState<"pending" | "reported" | "all">("pending");

  const posts = useMemo(() => getStoredPosts(), []);
  const comments = useMemo(() => getStoredComments(), []);

  const pendingPosts = posts.filter(p => p.modStatus === "pending");
  const reportedPosts = posts.filter(p => p.reported);
  const reportedComments = comments.filter(c => c.reported);

  const displayPosts = filter === "pending" ? pendingPosts : filter === "reported" ? reportedPosts : [...pendingPosts, ...reportedPosts];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/community" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Community
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">Moderation Queue</h1>
              <p className="text-xs text-muted-foreground">Review reported and pending content</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-bold text-warning">{pendingPosts.length}</p>
              <p className="text-[10px] text-muted-foreground">Pending Review</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-bold text-destructive">{reportedPosts.length}</p>
              <p className="text-[10px] text-muted-foreground">Reported Posts</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-3 text-center">
              <p className="text-xl font-bold text-destructive">{reportedComments.length}</p>
              <p className="text-[10px] text-muted-foreground">Reported Comments</p>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-4">
            {(["pending", "reported", "all"] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "text-[10px] font-mono px-2.5 py-1 rounded transition-colors capitalize",
                  filter === f ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Queue items */}
          <div className="space-y-3">
            {displayPosts.map(post => {
              const category = communityCategories.find(c => c.slug === post.categorySlug);
              return (
                <div key={post.id} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        {post.modStatus === "pending" && <Badge className="text-[8px] bg-warning/20 text-warning border-warning/30">PENDING</Badge>}
                        {post.reported && <Badge className="text-[8px] bg-destructive/20 text-destructive border-destructive/30">REPORTED</Badge>}
                        {category && <span className="text-[10px] font-mono text-muted-foreground">{category.emoji} r/{category.slug}</span>}
                        <span className="text-[10px] text-muted-foreground">by u/{post.authorName}</span>
                      </div>
                      <Link to={`/community/post/${post.id}`} className="text-sm font-semibold text-foreground hover:text-primary">{post.title}</Link>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{post.body.slice(0, 200)}</p>
                      {post.reportReasons.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {post.reportReasons.map(r => (
                            <span key={r} className="text-[9px] font-mono text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">{reasonLabels[r]}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1"><Eye className="w-3 h-3" /> View</Button>
                      <Button size="sm" className="h-7 text-xs gap-1 bg-accent text-accent-foreground hover:bg-accent/90"><Check className="w-3 h-3" /> Approve</Button>
                      <Button size="sm" variant="destructive" className="h-7 text-xs gap-1"><X className="w-3 h-3" /> Remove</Button>
                    </div>
                  </div>
                </div>
              );
            })}
            {displayPosts.length === 0 && (
              <div className="text-center py-12 text-sm text-muted-foreground">
                ✅ Queue is clear! No items to review.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityMod;
