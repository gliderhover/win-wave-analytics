import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserTier } from "@/contexts/UserTierContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useI18n } from "@/i18n/I18nContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  FlaskConical, Compass, CornerDownRight, CreditCard, Bell, Eye, GitCompare, Lock, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface MatchQuickActionsProps { matchId: string; teamA: string; teamB: string; className?: string; }
interface ActionItem { labelKey: string; icon: React.ReactNode; requiredTier: "base" | "pro" | "elite"; action: () => void; }

const MatchQuickActions = ({ matchId, teamA, teamB, className }: MatchQuickActionsProps) => {
  const navigate = useNavigate();
  const { hasAccess } = useUserTier();
  const isMobile = useIsMobile();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const matchLabel = `${teamA} vs ${teamB}`;

  const actions: ActionItem[] = [
    { labelKey: "quickActions.openMatchLab", icon: <FlaskConical className="w-3.5 h-3.5" />, requiredTier: "base", action: () => navigate(`/match/${matchId}`) },
    { labelKey: "quickActions.tactics", icon: <Compass className="w-3.5 h-3.5" />, requiredTier: "pro", action: () => navigate(`/match/${matchId}#tactics`) },
    { labelKey: "quickActions.cornersCards", icon: <CornerDownRight className="w-3.5 h-3.5" />, requiredTier: "pro", action: () => navigate(`/match/${matchId}#corners-cards`) },
    { labelKey: "quickActions.setAlerts", icon: <Bell className="w-3.5 h-3.5" />, requiredTier: "pro", action: () => toast.success(t("quickActions.alertSet", { match: matchLabel })) },
    { labelKey: "quickActions.addWatchlist", icon: <Eye className="w-3.5 h-3.5" />, requiredTier: "base", action: () => toast.success(t("quickActions.addedToWatchlist", { match: matchLabel })) },
    { labelKey: "quickActions.compare", icon: <GitCompare className="w-3.5 h-3.5" />, requiredTier: "elite", action: () => toast.info(t("quickActions.compareComingSoon")) },
  ];

  const handleClick = (item: ActionItem) => {
    if (!hasAccess(item.requiredTier)) { navigate("/pricing"); return; }
    item.action();
    setOpen(false);
  };

  const getLockedTooltip = (requiredTier: "base" | "pro" | "elite") =>
    requiredTier === "elite" ? t("quickActions.upgradeTooltipElite") : t("quickActions.upgradeTooltipPro");

  const menu = (
    <div className="py-1">
      <div className="px-3 py-1.5 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{t("quickActions.title")}</div>
      {actions.map((item) => {
        const locked = !hasAccess(item.requiredTier);
        return (
          <button key={item.labelKey} onClick={() => handleClick(item)}
            className={cn("flex items-center gap-2 w-full px-3 py-2 text-xs transition-colors",
              locked ? "text-muted-foreground/50 hover:bg-secondary/30" : "text-foreground hover:bg-primary/10 hover:text-primary"
            )}>
            {item.icon}
            <span className="flex-1 text-left">{t(item.labelKey)}</span>
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className={cn("inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border border-border",
          "bg-secondary/50 text-foreground hover:bg-primary/15 hover:text-primary hover:border-primary/40 transition-all", className)}
          aria-label={t("common.detail")}>
          {t("common.detail")}
          <ChevronRight className="w-3 h-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-56 p-0 border-border bg-card" onMouseLeave={() => !isMobile && setOpen(false)}>
        {menu}
      </PopoverContent>
    </Popover>
  );
};

export default MatchQuickActions;
