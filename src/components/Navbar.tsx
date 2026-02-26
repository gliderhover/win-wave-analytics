import { Activity, Crown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/matches", label: "Matches" },
  
  { to: "/performance", label: "Performance" },
  { to: "/pricing", label: "Pricing" },
];

const Navbar = () => {
  const { tier, setTier } = useUserTier();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-lg text-foreground">BetIQ</span>
            {tier === "pro" && (
              <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">PRO</span>
            )}
          </Link>
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "text-sm px-3 py-1.5 rounded-md transition-colors",
                  location.pathname === link.to
                    ? "text-foreground bg-secondary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Dev tier toggle */}
          <button
            onClick={() => setTier(tier === "free" ? "pro" : "free")}
            className="text-[10px] font-mono text-muted-foreground bg-secondary px-2 py-1 rounded border border-border hover:border-primary/30 transition-colors"
          >
            {tier === "free" ? "Switch to PRO" : "Switch to FREE"}
          </button>

          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</button>
          {tier === "free" && (
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
