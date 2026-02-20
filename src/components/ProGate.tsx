import { useUserTier } from "@/contexts/UserTierContext";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";

interface ProGateProps {
  children: ReactNode;
  label?: string;
}

const ProGate = ({ children, label = "Unlock Full Edge & Smart Money Signals" }: ProGateProps) => {
  const { isPro } = useUserTier();
  const navigate = useNavigate();

  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-card/90 backdrop-blur-md border border-primary/30 rounded-xl p-6 text-center max-w-xs card-glow">
          <Lock className="w-8 h-8 text-primary mx-auto mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
          <p className="text-xs text-muted-foreground mb-4">Upgrade to Pro for full access</p>
          <button
            onClick={() => navigate("/pricing")}
            className="gradient-primary text-primary-foreground font-semibold text-sm px-6 py-2 rounded-lg hover:opacity-90 transition-opacity w-full"
          >
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProGate;
