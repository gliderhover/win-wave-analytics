import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { communityCategories, checkSportsRelevance, filterProfanity, savePost, type CommunityPost, type PostType } from "@/lib/communityData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft, Shield, AlertTriangle, Send } from "lucide-react";

const postTypes: { value: PostType; label: string; emoji: string }[] = [
  { value: "discussion", label: "Discussion", emoji: "💬" },
  { value: "match_thread", label: "Match Thread", emoji: "⚽" },
  { value: "analysis", label: "Analysis", emoji: "📊" },
  { value: "highlight", label: "Highlight / Clip", emoji: "🎬" },
];

const CommunityNewPost = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCategory = searchParams.get("category") || "";

  const [type, setType] = useState<PostType>("discussion");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [categorySlug, setCategorySlug] = useState(preselectedCategory);
  const [tags, setTags] = useState("");
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [showWarning, setShowWarning] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const relevance = useMemo(() => checkSportsRelevance(title, body), [title, body]);

  const canSubmit = title.trim().length > 3 && body.trim().length > 10 && categorySlug;

  const handleSubmit = (forReview = false) => {
    if (!canSubmit) return;

    // Sports relevance check
    if (!forReview && !relevance.relevant) {
      setShowWarning(true);
      return;
    }

    const post: CommunityPost = {
      id: `p_${Date.now()}`,
      type,
      title: filterProfanity(title.trim()),
      body: filterProfanity(body.trim()),
      authorId: "u_self",
      authorName: "You",
      authorReputation: 0,
      authorBadges: [],
      categorySlug,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      upvotes: 1,
      downvotes: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
      reported: false,
      reportReasons: [],
      modStatus: forReview ? "pending" : "approved",
      ...(type === "match_thread" && pollQuestion && {
        pollQuestion,
        pollOptions: pollOptions.filter(Boolean).map(label => ({ label, votes: 0 })),
      }),
    };

    savePost(post);
    setSubmitted(true);
    setTimeout(() => navigate("/community"), 500);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <button onClick={() => navigate(-1)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-4">
            <ArrowLeft className="w-3 h-3" /> Back
          </button>

          <h1 className="text-xl font-bold text-foreground mb-1">Create Post</h1>
          <p className="text-xs text-muted-foreground mb-6">Share your sports analysis, start a match thread, or join the discussion.</p>

          {/* Sports-only reminder */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20 mb-6">
            <Shield className="w-4 h-4 text-primary shrink-0" />
            <p className="text-[11px] text-muted-foreground">
              <span className="text-primary font-semibold">Keep it about sports.</span> Off-topic posts may be removed. See{" "}
              <span className="text-primary">community guidelines</span> for details.
            </p>
          </div>

          {/* Post type */}
          <div className="mb-4">
            <label className="text-xs font-medium text-foreground mb-2 block">Post Type</label>
            <div className="flex gap-2 flex-wrap">
              {postTypes.map(pt => (
                <button
                  key={pt.value}
                  onClick={() => setType(pt.value)}
                  className={cn(
                    "text-xs font-mono px-3 py-1.5 rounded-md border transition-colors",
                    type === pt.value ? "bg-primary/20 text-primary border-primary/30" : "text-muted-foreground border-border hover:border-primary/20"
                  )}
                >
                  {pt.emoji} {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category (required) */}
          <div className="mb-4">
            <label className="text-xs font-medium text-foreground mb-2 block">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              value={categorySlug}
              onChange={e => setCategorySlug(e.target.value)}
              className="w-full h-9 rounded-md border border-input bg-secondary px-3 text-xs text-foreground"
            >
              <option value="">Select a sports category...</option>
              {communityCategories.map(cat => (
                <option key={cat.id} value={cat.slug}>
                  {cat.emoji} {cat.name} {cat.parent ? `(${cat.parent})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="text-xs font-medium text-foreground mb-2 block">
              Title <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="An interesting title about sports..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="bg-secondary border-border text-sm"
              maxLength={300}
            />
            <span className="text-[10px] text-muted-foreground mt-1 block">{title.length}/300</span>
          </div>

          {/* Body */}
          <div className="mb-4">
            <label className="text-xs font-medium text-foreground mb-2 block">
              Content <span className="text-destructive">*</span>
            </label>
            <Textarea
              placeholder={type === "highlight" ? "Paste a link and add your commentary..." : type === "analysis" ? "Write your analysis... (Markdown supported)" : "What's on your mind? Keep it sports-related."}
              value={body}
              onChange={e => setBody(e.target.value)}
              className="min-h-[180px] bg-secondary border-border text-sm"
            />
          </div>

          {/* Tags */}
          <div className="mb-4">
            <label className="text-xs font-medium text-foreground mb-2 block">Tags (comma-separated)</label>
            <Input
              placeholder="Arsenal, EPL, xG, Tactics"
              value={tags}
              onChange={e => setTags(e.target.value)}
              className="bg-secondary border-border text-sm"
            />
          </div>

          {/* Match Thread: Poll */}
          {type === "match_thread" && (
            <div className="mb-4 p-3 rounded-lg border border-border bg-card">
              <label className="text-xs font-medium text-foreground mb-2 block">📊 Poll (optional)</label>
              <Input
                placeholder="Poll question, e.g. 'Who wins?'"
                value={pollQuestion}
                onChange={e => setPollQuestion(e.target.value)}
                className="bg-secondary border-border text-sm mb-2"
              />
              {pollOptions.map((opt, i) => (
                <Input
                  key={i}
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => { const n = [...pollOptions]; n[i] = e.target.value; setPollOptions(n); }}
                  className="bg-secondary border-border text-xs mb-1"
                />
              ))}
              {pollOptions.length < 4 && (
                <button onClick={() => setPollOptions([...pollOptions, ""])} className="text-[10px] text-primary hover:underline mt-1">+ Add option</button>
              )}
            </div>
          )}

          {/* Sports relevance warning */}
          {showWarning && !relevance.relevant && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10 border border-warning/30 mb-4">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-warning">This looks off-topic</p>
                <p className="text-[11px] text-muted-foreground">Community is sports-only — please revise your post to include sports-related content.</p>
                <Button size="sm" variant="outline" className="mt-2 text-xs" onClick={() => handleSubmit(true)}>
                  Submit for Review (Mod Queue)
                </Button>
              </div>
            </div>
          )}

          {/* Relevance indicator */}
          {title.length > 5 && (
            <div className="flex items-center gap-2 mb-4">
              <div className={cn("w-2 h-2 rounded-full", relevance.relevant ? "bg-accent" : "bg-warning")} />
              <span className="text-[10px] font-mono text-muted-foreground">
                Sports relevance: {(relevance.score * 100).toFixed(0)}%
                {relevance.relevant ? " ✓" : " — add more sports context"}
              </span>
            </div>
          )}

          {/* Submit */}
          <div className="flex gap-3">
            <Button onClick={() => navigate(-1)} variant="outline">Cancel</Button>
            <Button
              onClick={() => handleSubmit(false)}
              disabled={!canSubmit || submitted}
              className="gradient-primary text-primary-foreground"
            >
              <Send className="w-4 h-4 mr-1" />
              {submitted ? "Posted!" : "Publish Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityNewPost;
