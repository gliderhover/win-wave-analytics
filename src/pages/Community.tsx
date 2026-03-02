import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/community/PostCard";
import CommunitySidebar from "@/components/community/CommunitySidebar";
import { communityCategories, getStoredPosts, getStoredComments, sortPosts, type SortMode } from "@/lib/communityData";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Plus, Shield, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const sortTabs: { label: string; value: SortMode }[] = [
  { label: "🔥 Hot", value: "hot" },
  { label: "🆕 New", value: "new" },
  { label: "⬆ Top 24h", value: "top_24h" },
  { label: "📅 Top Week", value: "top_week" },
  { label: "🏆 All Time", value: "top_all" },
];

const Community = () => {
  const [sort, setSort] = useState<SortMode>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const posts = useMemo(() => getStoredPosts(), []);
  const comments = useMemo(() => getStoredComments(), []);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(p => p.modStatus !== "removed");
    if (selectedCategory) filtered = filtered.filter(p => p.categorySlug === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || p.tags.some(t => t.toLowerCase().includes(q)));
    }
    return sortPosts(filtered, sort);
  }, [posts, sort, selectedCategory, searchQuery]);

  // Group categories: parents first, children indented
  const parentCategories = communityCategories.filter(c => !c.parent);
  const childCategories = (parentSlug: string) => communityCategories.filter(c => c.parent === parentSlug.replace("-", ""));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                Community
                <Badge variant="outline" className="text-[10px] font-mono">SPORTS ONLY</Badge>
              </h1>
              <p className="text-xs text-muted-foreground font-mono mt-1">Discuss matches, tactics, analytics & more with fellow sports fans</p>
            </div>
            <Link
              to="/community/new"
              className="gradient-primary text-primary-foreground text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> New Post
            </Link>
          </div>

          {/* Sports-only banner */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-4">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              <span className="text-primary font-semibold">Sports-only community.</span> Keep discussions about matches, leagues, players, tactics, and analytics. Off-topic posts may be removed.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
            {/* Main feed */}
            <div>
              {/* Category pills */}
              <div className="flex gap-2 flex-wrap mb-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={cn(
                    "text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors",
                    !selectedCategory ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground border-border hover:border-primary/20"
                  )}
                >
                  All
                </button>
                {parentCategories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                    className={cn(
                      "text-[11px] font-mono px-2.5 py-1 rounded-md border transition-colors",
                      selectedCategory === cat.slug ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground border-border hover:border-primary/20"
                    )}
                  >
                    {cat.emoji} {cat.name}
                  </button>
                ))}
              </div>

              {/* Search + Sort */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-xs bg-secondary border-border"
                  />
                </div>
                <div className="flex gap-1">
                  {sortTabs.map(tab => (
                    <button
                      key={tab.value}
                      onClick={() => setSort(tab.value)}
                      className={cn(
                        "text-[10px] font-mono px-2 py-1 rounded transition-colors",
                        sort === tab.value ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-2">
                {filteredPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
                {filteredPosts.length === 0 && (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                    No posts found. Be the first to start a discussion!
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block">
              <CommunitySidebar
                category={selectedCategory ? communityCategories.find(c => c.slug === selectedCategory) : undefined}
                posts={posts}
                comments={comments}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <Link
        to="/community/new"
        className="fixed bottom-6 right-6 lg:hidden w-14 h-14 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-lg z-30"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default Community;
