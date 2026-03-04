import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/community/PostCard";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { communityCategories, getStoredPosts, getStoredComments, sortPosts, type SortMode } from "@/lib/communityData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ArrowLeft, Plus, Users } from "lucide-react";

const sortTabs: { label: string; value: SortMode }[] = [
  { label: "🔥 Hot", value: "hot" },
  { label: "🆕 New", value: "new" },
  { label: "⬆ Top 24h", value: "top_24h" },
  { label: "🏆 All Time", value: "top_all" },
];

const CommunityCategory = () => {
  const { categorySlug } = useParams<{ categorySlug: string }>();
  const [sort, setSort] = useState<SortMode>("hot");

  const category = communityCategories.find(c => c.slug === categorySlug);
  const posts = useMemo(() => getStoredPosts(), []);
  const comments = useMemo(() => getStoredComments(), []);

  const filteredPosts = useMemo(() => {
    const catPosts = posts.filter(p => p.categorySlug === categorySlug && p.modStatus !== "removed");
    return sortPosts(catPosts, sort);
  }, [posts, sort, categorySlug]);

  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-20 pb-20 px-4 text-center">
          <p className="text-muted-foreground">Category not found.</p>
          <Link to="/community" className="text-primary hover:underline text-sm mt-2 block">← Back to Community</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Category header */}
          <div className="mb-6">
            <Link to="/community" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-3">
              <ArrowLeft className="w-3 h-3" /> Back to Community
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {category.emoji} r/{category.slug}
                  <Badge variant="outline" className="text-[10px] font-mono">{(category.followers / 1000).toFixed(0)}k members</Badge>
                </h1>
                <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="text-xs font-mono px-3 py-1.5 rounded border border-primary/30 text-primary hover:bg-primary/10 transition-colors flex items-center gap-1">
                  <Users className="w-3 h-3" /> Join
                </button>
                <Link
                  to={`/community/new?category=${category.slug}`}
                  className="gradient-primary text-primary-foreground text-xs font-semibold px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Post
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            <div>
              {/* Sort tabs */}
              <div className="flex gap-1 mb-4">
                {sortTabs.map(tab => (
                  <button
                    key={tab.value}
                    onClick={() => setSort(tab.value)}
                    className={cn(
                      "text-[10px] font-mono px-2.5 py-1 rounded transition-colors",
                      sort === tab.value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No posts in this category yet. Start the conversation!
                  </div>
                )}
              </div>
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

export default CommunityCategory;
