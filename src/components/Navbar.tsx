import { useEffect, useState } from "react";
import { Activity, Crown, Lock, ChevronDown, LogOut, User, Briefcase, BarChart3, Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useUserTier, Tier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n/I18nContext";
import { leagues } from "@/lib/leagueData";
import { fetchAvailableLeagues } from "@/lib/api";
import { DEFAULT_LEAGUE_ID } from "@/contexts/LeagueContext";
import { ALLOWED_LEAGUES } from "@/constants/allowedLeagues";
import { cn } from "@/lib/utils";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/dashboard", labelKey: "nav.dashboard" },
  { to: "/matches", labelKey: "nav.matches" },
  { to: "/suggestions", labelKey: "nav.suggestions" },
  { to: "/community", labelKey: "nav.community", isNew: true },
  { to: "/simulation", labelKey: "nav.simulation" },
  { to: "/elite", labelKey: "nav.elite", requiresTier: "elite" as Tier },
  { to: "/pricing", labelKey: "nav.pricing" },
];

const tiers: Tier[] = ["base", "pro", "elite"];

const Navbar = () => {
  const { tier, setTier, hasAccess } = useUserTier();
  const { selectedLeague, setSelectedLeague } = useLeague();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navigate = useNavigate();

  // Optional: fetch for analytics/background; dropdown uses allowedLeagues only
  useQuery({
    queryKey: ["available-leagues", 90],
    queryFn: () => fetchAvailableLeagues({ days: 90 }),
    staleTime: 5 * 60 * 1000,
  });

  const selectedApiId = selectedLeague.startsWith("sm:") ? selectedLeague.slice(3) : null;

  let currentLeague = t("nav.allLeagues");
  if (selectedApiId) {
    const found = ALLOWED_LEAGUES.find((l) => String(l.id) === selectedApiId);
    if (found) currentLeague = found.name;
  } else if (selectedLeague !== "all") {
    const staticLeague = leagues.find((l) => l.id === selectedLeague);
    if (staticLeague) currentLeague = staticLeague.shortName;
  }

  useEffect(() => {
    if (!selectedApiId) return;
    const inList = ALLOWED_LEAGUES.some((l) => String(l.id) === selectedApiId);
    if (inList) return;
    setSelectedLeague(`sm:${DEFAULT_LEAGUE_ID}`);
  }, [selectedApiId, setSelectedLeague]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">BetIQ</span>
            {tier !== "base" && (
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 uppercase">
                {tier}
              </span>
            )}
          </Link>

          {/* League selector */}
          <DropdownMenu>
            <DropdownMenuTrigger className="hidden md:flex items-center gap-1 text-xs font-mono px-2.5 py-1.5 rounded-md bg-secondary border border-border text-foreground hover:border-primary/30 transition-colors">
              <span>🌍</span> {currentLeague}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              <DropdownMenuItem
                onClick={() => setSelectedLeague("all")}
                className={cn(selectedLeague === "all" && "text-primary")}
              >
                🌍 {t("nav.allLeagues")}
              </DropdownMenuItem>

              {ALLOWED_LEAGUES.map((l) => {
                const value = `sm:${l.id}`;
                return (
                  <DropdownMenuItem
                    key={l.id}
                    onClick={() => setSelectedLeague(value)}
                    className={cn(selectedLeague === value && "text-primary")}
                  >
                    {l.name}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => {
              const locked = link.requiresTier && !hasAccess(link.requiresTier);
              const isActive = location.pathname === link.to || location.pathname.startsWith(link.to + "/");
              return (
                <Link
                  key={link.to}
                  to={locked ? "/pricing" : link.to}
                  className={cn(
                    "text-sm px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5",
                    isActive
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground",
                    locked && "opacity-60"
                  )}
                >
                  {t(link.labelKey)}
                  {link.isNew && (
                    <span className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full border border-primary/30 leading-none">{t("nav.new")}</span>
                  )}
                  {locked && <Lock className="w-3 h-3" />}
                  {link.requiresTier === "elite" && !locked && <Crown className="w-3 h-3 text-primary" />}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />

          {/* Tier selector */}
          <div className="flex items-center bg-secondary rounded-lg border border-border p-0.5">
            {tiers.map(t => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={cn(
                  "text-[10px] font-mono px-2.5 py-1 rounded-md transition-all uppercase",
                  tier === t
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Auth-aware section */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-secondary transition-colors">
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                    {user.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-foreground hidden sm:inline">{user.displayName}</span>
                <ChevronDown className="w-3 h-3 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[180px]">
                <DropdownMenuItem onClick={() => navigate("/account")}>
                  <User className="w-4 h-4 mr-2" /> Account
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/account/performance")}>
                  <BarChart3 className="w-4 h-4 mr-2" /> My Performance
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/simulation/portfolio")}>
                  <Briefcase className="w-4 h-4 mr-2" /> Simulation Portfolio
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {t("nav.login")}
              </Link>
              {tier === "base" && (
                <Link
                  to="/pricing"
                  className="text-sm gradient-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
                >
                  <Crown className="w-3.5 h-3.5" />
                  {t("nav.upgrade")}
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
