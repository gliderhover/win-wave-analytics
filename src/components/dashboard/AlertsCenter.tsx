import ProGate from "@/components/ProGate";
import { useUserTier } from "@/contexts/UserTierContext";
import { Bell, TrendingUp, ArrowLeftRight, RotateCcw, Mail } from "lucide-react";
import { useState } from "react";

const AlertsCenter = () => {
  const { isPro } = useUserTier();
  const [alerts, setAlerts] = useState({
    edge: { enabled: true, threshold: 3 },
    lineSpike: { enabled: true },
    modelFlip: { enabled: false },
  });
  const [emailSent, setEmailSent] = useState(false);

  const toggle = (key: keyof typeof alerts) => {
    setAlerts(prev => ({ ...prev, [key]: { ...prev[key], enabled: !prev[key].enabled } }));
  };

  const content = (
    <div className="gradient-card rounded-xl border border-border p-5 card-glow">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">Alerts Center</h3>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-signal-bullish" />
            <span className="text-sm text-foreground">Edge {">"} {alerts.edge.threshold}%</span>
          </div>
          <button
            onClick={() => toggle("edge")}
            className={`w-10 h-5 rounded-full transition-colors relative ${alerts.edge.enabled ? "bg-primary" : "bg-secondary"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${alerts.edge.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="w-3.5 h-3.5 text-signal-neutral" />
            <span className="text-sm text-foreground">Line Movement Spike</span>
          </div>
          <button
            onClick={() => toggle("lineSpike")}
            className={`w-10 h-5 rounded-full transition-colors relative ${alerts.lineSpike.enabled ? "bg-primary" : "bg-secondary"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${alerts.lineSpike.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-3.5 h-3.5 text-signal-bearish" />
            <span className="text-sm text-foreground">Model Flip</span>
          </div>
          <button
            onClick={() => toggle("modelFlip")}
            className={`w-10 h-5 rounded-full transition-colors relative ${alerts.modelFlip.enabled ? "bg-primary" : "bg-secondary"}`}
          >
            <div className={`w-4 h-4 rounded-full bg-foreground absolute top-0.5 transition-transform ${alerts.modelFlip.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
          </button>
        </div>

        <button
          onClick={() => setEmailSent(true)}
          className="w-full mt-2 flex items-center justify-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm font-semibold py-2.5 rounded-lg transition-colors"
        >
          <Mail className="w-4 h-4" />
          {emailSent ? "✓ Alert Preferences Saved" : "Save & Enable Email Alerts"}
        </button>
      </div>
    </div>
  );

  if (!isPro) {
    return <ProGate label="Unlock Alert System">{content}</ProGate>;
  }

  return content;
};

export default AlertsCenter;
