import { MatchData } from "@/lib/mockData";

const AIInsight = ({ match }: { match: MatchData }) => {
  return (
    <div className="gradient-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🤖</span>
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">AI Insight</h3>
      </div>
      <p className="text-sm text-muted-foreground leading-relaxed">{match.aiInsight}</p>
    </div>
  );
};

export default AIInsight;
