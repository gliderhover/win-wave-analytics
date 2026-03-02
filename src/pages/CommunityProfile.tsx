import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/community/PostCard";
import { mockUsers, getStoredPosts, getStoredComments } from "@/lib/communityData";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, FileText, Star } from "lucide-react";

const CommunityProfile = () => {
  const { userId } = useParams<{ userId: string }>();

  const user = mockUsers.find(u => u.id === userId);
  const posts = useMemo(() => getStoredPosts().filter(p => p.authorId === userId), [userId]);
  const comments = useMemo(() => getStoredComments().filter(c => c.authorId === userId), [userId]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-20 px-4 text-center">
          <p className="text-muted-foreground">User not found.</p>
          <Link to="/community" className="text-primary hover:underline text-sm mt-2 block">← Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/community" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back to Community
          </Link>

          {/* Profile card */}
          <div className="rounded-lg border border-border bg-card p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1">
                <h1 className="text-lg font-bold text-foreground">{user.name}</h1>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-xs font-mono text-primary flex items-center gap-1"><Star className="w-3 h-3" /> {user.reputation} rep</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><FileText className="w-3 h-3" /> {user.postCount} posts</span>
                  <span className="text-xs text-muted-foreground flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {user.commentCount} comments</span>
                  <span className="text-[10px] text-muted-foreground">Joined {user.joinedAt}</span>
                </div>
                {user.badges.length > 0 && (
                  <div className="flex gap-1.5 mt-2">
                    {user.badges.map(b => (
                      <Badge key={b} className="text-[9px] bg-primary/10 text-primary border-primary/20">{b}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Posts */}
          <h2 className="text-sm font-semibold text-foreground mb-3">Posts by {user.name}</h2>
          <div className="space-y-2">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
            {posts.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No posts yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityProfile;
