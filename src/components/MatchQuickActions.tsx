import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserTier } from "@/contexts/UserTierContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  FlaskConical,
  Compass,
  CornerDownRight,
  CreditCard,
  Bell,
  Eye,
  GitCompare,
  Lock,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface MatchQuickActionsProps {
  matchId: string;
  teamA: string;
  teamB: string;
  className?: string;
}

interface ActionItem {
  label: string;
  icon: React.ReactNode;
  requiredTier: "base" | "pro" | "elite";
  action: () => void;
}

const MatchQuickActions = ({ matchId, teamA, teamB, className }: MatchQuickActionsProps) => {
  const navigate = useNavigate();
  const { hasAccess, tier } = useUserTier();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const actions: ActionItem[] = [
    {
      label: "Open Match Lab",
      icon: <FlaskConical className="w-3.5 h-3.5" />,
      requiredTier: "base",
      action: () => navigate(`/match/${matchId}`),
    },
    {
      label: "Tactics & Formation",
      icon: <Compass className="w-3.5 h-3.5" />,
      requiredTier: "pro",
      action: () => navigate(`/match/${matchId}#tactics`),
    },
    {
      label: "Corners & Cards",
      icon: <CornerDownRight className="w-3.5 h-3.5" />,
      requiredTier: "pro",
      action: () => navigate(`/match/${matchId}#corners-cards`),
    },
    {
      label: "Set Alerts",
      icon: <Bell className="w-3.5 h-3.5" />,
      requiredTier: "pro",
      action: () => {
        toast.success(`Alert set for ${teamA} vs ${teamB}`);
      },
    },
    {
      label: "Add to Watchlist",
      icon: <Eye className="w-3.5 h-3.5" />,
      requiredTier: "base",
      action: () => {
        toast.success(`${teamA} vs ${teamB} added to watchlist`);
      },
    },
    {
      label: "Compare",
      icon: <GitCompare className="w-3.5 h-3.5" />,
      requiredTier: "elite",
      action: () => {
        toast.info("Compare mode coming soon");
      },
    },
  ];

  const handleClick = (item: ActionItem) => {
    if (!hasAccess(item.requiredTier)) {
      navigate("/pricing");
      return;
    }
    item.action();
    setOpen(false);
  };

  const getLockedTooltip = (requiredTier: "base" | "pro" | "elite") => {
    if (requiredTier === "elite") return "Elite only";
    return "Upgrade to Pro to unlock";
  };

  const menu = (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
        Match Details
      </div>
      {actions.map((item) => {
        const locked = !hasAccess(item.requiredTier);
        return (
          <button
            key={item.label}
            onClick={() => handleClick(item)}
            className={cn(
              "flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors",
              locked
                ? "text-muted-foreground/50 hover:bg-secondary/30"
                : "text-foreground hover:bg-primary/10 hover:text-primary"
            )}
          >
            {item.icon}
            <span className="flex-1 text-left">{item.label}</span>
            {locked && (
              <span className="flex items-center gap-1 text-[9px] text-muted-foreground/60">
                <Lock className="w-3 h-3" />
                <span className="hidden sm:inline">{getLockedTooltip(item.requiredTier)}</span>
              </span>
            )}
          </button>
        );
      })}
    </div>
  );

  const triggerButton = (
    <button
      className={cn(
        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-border",
        "bg-secondary/50 text-foreground hover:bg-primary/15 hover:text-primary hover:border-primary/40 transition-all",
        className
      )}
      aria-label="Detail"
    >
      Detail
      <ChevronRight className="w-3 h-3" />
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {triggerButton}
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-56 p-0 border-border bg-card"
        onMouseLeave={() => !isMobile && setOpen(false)}
      >
        {menu}
      </PopoverContent>
    </Popover>
  );
};

export default MatchQuickActions;
