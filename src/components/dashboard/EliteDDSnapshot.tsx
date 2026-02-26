import { useUserTier } from "@/contexts/UserTierContext";
import { Crown, AlertTriangle, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { eliteDDSnapshot } from "@/lib/eliteData";
import ProGate from "@/components/ProGate";

const EliteDDSnapshotContent = () => {
  const navigate = useNavigate();
  const { topRiskFlag, topEdgeDriver, injuryImpact } = eliteDDSnapshot;

  return (
    <div className="gradient-card rounded-xl border border-primary/30 p-5 shadow-[0_0_30px_hsl(175_85%_50%/0.1)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Elite DD Snapshot</h3>
          <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">ELITE</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${topRiskFlag.level === "red" ? "text-signal-bearish" : topRiskFlag.level === "amber" ? "text-signal-neutral" : "text-signal-bullish"}`} />
          <p className="text-xs text-secondary-foreground">{topRiskFlag.text}</p>
        </div>
        <div className="flex items-start gap-2">
          <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0 text-signal-bullish" />
          <p className="text-xs text-secondary-foreground">{topEdgeDriver.text}</p>
        </div>
        <div className="flex items-start gap-2">
          <Activity className="w-4 h-4 mt-0.5 flex-shrink-0 text-signal-neutral" />
          <p className="text-xs text-secondary-foreground">{injuryImpact.text}</p>
        </div>
      </div>

      <button
        onClick={() => navigate("/elite?tab=due-diligence")}
        className="w-full mt-4 text-xs font-semibold text-primary bg-primary/10 border border-primary/20 rounded-lg py-2 hover:bg-primary/20 transition-colors"
      >
        Open Full Due Diligence →
      </button>
    </div>
  );
};

const EliteDDSnapshot = () => {
  return (
    <ProGate requiredTier="elite" label="Unlock Elite Intelligence">
      <EliteDDSnapshotContent />
    </ProGate>
  );
};

export default EliteDDSnapshot;
