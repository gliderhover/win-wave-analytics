import { useState } from "react";
import { ArrowBigUp, ArrowBigDown, Flag, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { CommunityComment, filterProfanity, saveComment } from "@/lib/communityData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CommentThreadProps {
  comments: CommunityComment[];
  postId: string;
  onRefresh: () => void;
  sortMode?: "best" | "new" | "top";
}

const CommentThread = ({ comments, postId, onRefresh, sortMode = "best" }: CommentThreadProps) => {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [newComment, setNewComment] = useState("");

  const postComments = comments.filter(c => c.postId === postId);

  const sorted = [...postComments].sort((a, b) => {
    if (sortMode === "new") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortMode === "top") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
    // "best" — balance votes and age
    const scoreA = (a.upvotes - a.downvotes) / Math.pow((Date.now() - new Date(a.createdAt).getTime()) / 3600000 + 2, 0.5);
    const scoreB = (b.upvotes - b.downvotes) / Math.pow((Date.now() - new Date(b.createdAt).getTime()) / 3600000 + 2, 0.5);
    return scoreB - scoreA;
  });

  const topLevel = sorted.filter(c => !c.parentId);
  const getReplies = (parentId: string) => sorted.filter(c => c.parentId === parentId);

  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    const comment: CommunityComment = {
      id: `c_${Date.now()}`,
      postId,
      authorId: "u_self",
      authorName: "You",
      authorReputation: 0,
      body: filterProfanity(newComment),
      upvotes: 1,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      reported: false,
      reportReasons: [],
    };
    saveComment(comment);
    setNewComment("");
    onRefresh();
  };

  const handleSubmitReply = (parentId: string) => {
    if (!replyText.trim()) return;
    const comment: CommunityComment = {
      id: `c_${Date.now()}`,
      postId,
      parentId,
      authorId: "u_self",
      authorName: "You",
      authorReputation: 0,
      body: filterProfanity(replyText),
      upvotes: 1,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      reported: false,
      reportReasons: [],
    };
    saveComment(comment);
    setReplyText("");
    setReplyTo(null);
    onRefresh();
  };

  return (
    <div className="space-y-4">
      {/* New comment composer */}
      <div className="rounded-lg border border-border bg-card p-3">
        <Textarea
          placeholder="Add a comment... (Keep it about sports 🏟️)"
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="min-h-[60px] text-sm bg-secondary border-border"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-[10px] text-muted-foreground">Be respectful. Sports discussion only.</span>
          <Button size="sm" onClick={handleSubmitComment} disabled={!newComment.trim()}>Post Comment</Button>
        </div>
      </div>

      {/* Comments */}
      {topLevel.map(comment => (
        <CommentNode
          key={comment.id}
          comment={comment}
          replies={getReplies(comment.id)}
          allComments={sorted}
          depth={0}
          replyTo={replyTo}
          replyText={replyText}
          onSetReplyTo={setReplyTo}
          onSetReplyText={setReplyText}
          onSubmitReply={handleSubmitReply}
        />
      ))}

      {topLevel.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No comments yet. Be the first to share your thoughts!</p>
      )}
    </div>
  );
};

interface CommentNodeProps {
  comment: CommunityComment;
  replies: CommunityComment[];
  allComments: CommunityComment[];
  depth: number;
  replyTo: string | null;
  replyText: string;
  onSetReplyTo: (id: string | null) => void;
  onSetReplyText: (text: string) => void;
  onSubmitReply: (parentId: string) => void;
}

const CommentNode = ({ comment, replies, allComments, depth, replyTo, replyText, onSetReplyTo, onSetReplyText, onSubmitReply }: CommentNodeProps) => {
  const netVotes = comment.upvotes - comment.downvotes;
  const timeAgo = getTimeAgo(comment.createdAt);
  const nestedReplies = (id: string) => allComments.filter(c => c.parentId === id);

  return (
    <div className={cn("relative", depth > 0 && "ml-4 pl-3 border-l-2 border-border/50")}>
      <div className="py-2">
        <div className="flex items-center gap-2 mb-1">
          <Link to={`/community/profile/${comment.authorId}`} className="text-[11px] font-medium text-foreground hover:text-primary">
            {comment.authorName}
          </Link>
          {comment.authorReputation > 2000 && (
            <span className="text-[9px] font-mono text-primary">⭐ {comment.authorReputation}</span>
          )}
          <span className="text-[10px] text-muted-foreground">• {timeAgo}</span>
        </div>
        <p className="text-xs text-foreground/90 leading-relaxed">{comment.body}</p>
        <div className="flex items-center gap-3 mt-1.5">
          <div className="flex items-center gap-1">
            <button className={cn("p-0.5 rounded hover:bg-primary/10", comment.userVote === 1 && "text-primary")}>
              <ArrowBigUp className="w-3.5 h-3.5" />
            </button>
            <span className={cn("text-[10px] font-mono", netVotes > 0 ? "text-primary" : "text-muted-foreground")}>{netVotes}</span>
            <button className={cn("p-0.5 rounded hover:bg-destructive/10", comment.userVote === -1 && "text-destructive")}>
              <ArrowBigDown className="w-3.5 h-3.5" />
            </button>
          </div>
          {depth < 3 && (
            <button
              onClick={() => onSetReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
            >
              <MessageSquare className="w-3 h-3" /> Reply
            </button>
          )}
          <button className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
            <Flag className="w-3 h-3" /> Report
          </button>
        </div>

        {/* Reply composer */}
        {replyTo === comment.id && (
          <div className="mt-2 ml-2">
            <Textarea
              placeholder="Write a reply..."
              value={replyText}
              onChange={e => onSetReplyText(e.target.value)}
              className="min-h-[50px] text-xs bg-secondary border-border"
            />
            <div className="flex gap-2 mt-1">
              <Button size="sm" variant="ghost" onClick={() => onSetReplyTo(null)}>Cancel</Button>
              <Button size="sm" onClick={() => onSubmitReply(comment.id)} disabled={!replyText.trim()}>Reply</Button>
            </div>
          </div>
        )}
      </div>

      {/* Nested replies */}
      {depth < 2 && replies.map(reply => (
        <CommentNode
          key={reply.id}
          comment={reply}
          replies={nestedReplies(reply.id)}
          allComments={allComments}
          depth={depth + 1}
          replyTo={replyTo}
          replyText={replyText}
          onSetReplyTo={onSetReplyTo}
          onSetReplyText={onSetReplyText}
          onSubmitReply={onSubmitReply}
        />
      ))}
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

export default CommentThread;
