import { Activity, Crown, Lock, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserTier, Tier } from "@/contexts/UserTierContext";
import { useLeague } from "@/contexts/LeagueContext";
import { leagues } from "@/lib/leagueData";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/matches", label: "Matches" },
  { to: "/suggestions", label: "Suggestions" },
  { to: "/simulation", label: "Simulation", isNew: true },
  { to: "/performance", label: "Performance" },
  { to: "/elite", label: "Elite", requiresTier: "elite" as Tier },
  { to: "/pricing", label: "Pricing" },
];

const tiers: Tier[] = ["base", "pro", "elite"];

const Navbar = () => {
  const { tier, setTier, hasAccess } = useUserTier();
  const { selectedLeague, setSelectedLeague } = useLeague();
  const location = useLocation();

  const currentLeague = selectedLeague === "all"
    ? "All Leagues"
    : leagues.find(l => l.id === selectedLeague)?.shortName ?? "All Leagues";

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
              {leagues.find(l => l.id === selectedLeague)?.logo ?? "🌍"} {currentLeague}
              <ChevronDown className="w-3 h-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              <DropdownMenuItem onClick={() => setSelectedLeague("all")} className={cn(selectedLeague === "all" && "text-primary")}>
                🌍 All Leagues
              </DropdownMenuItem>
              {leagues.map(l => (
                <DropdownMenuItem key={l.id} onClick={() => setSelectedLeague(l.id)} className={cn(selectedLeague === l.id && "text-primary")}>
                  {l.logo} {l.shortName}
                </DropdownMenuItem>
              ))}
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
                  {link.label}
                  {(link as any).isNew && (
                    <span className="text-[8px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full border border-primary/30 leading-none">NEW</span>
                  )}
                  {locked && <Lock className="w-3 h-3" />}
                  {link.requiresTier === "elite" && !locked && <Crown className="w-3 h-3 text-primary" />}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* 3-state tier segmented control */}
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

          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</button>
          {tier === "base" && (
            <Link
              to="/pricing"
              className="text-sm gradient-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1.5"
            >
              <Crown className="w-3.5 h-3.5" />
              Upgrade
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
