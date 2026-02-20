import { TrendingUp } from "lucide-react";

const TopEdgeRibbon = () => {
  return (
    <div className="bg-primary/10 border-b border-primary/20 py-2 px-4 sticky top-16 z-40">
      <div className="container mx-auto flex items-center justify-center gap-3 text-xs font-mono">
        <TrendingUp className="w-3.5 h-3.5 text-primary" />
        <span className="text-primary font-semibold">TODAY'S BEST EDGE:</span>
        <span className="text-foreground">Brazil vs Germany</span>
        <span className="text-signal-bullish font-bold">+5.2% Edge</span>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground">Model: 53.2% | Market: 48.0%</span>
      </div>
    </div>
  );
};

export default TopEdgeRibbon;
