import { Link, Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  User, Shield, CreditCard, Bell, Settings, Link2, Database,
  HelpCircle, BarChart3, AlertTriangle, ChevronDown, Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatNYDate } from "@/lib/time";

const sidebarItems = [
  { to: "/account", label: "Profile", icon: User, end: true },
  { to: "/account/security", label: "Security", icon: Shield },
  { to: "/account/subscription", label: "Subscription & Billing", icon: CreditCard },
  { to: "/account/notifications", label: "Notifications", icon: Bell },
  { to: "/account/preferences", label: "Preferences", icon: Settings },
  { to: "/account/connections", label: "Connected Accounts", icon: Link2 },
  { to: "/account/privacy", label: "Data & Privacy", icon: Database },
  { to: "/account/support", label: "Support", icon: HelpCircle },
  { to: "/account/performance", label: "My Performance", icon: BarChart3 },
  { to: "/account/danger", label: "Danger Zone", icon: AlertTriangle },
];

const AccountLayout = () => {
  const { user } = useAuth();
  const { tier } = useUserTier();
  const location = useLocation();
  const isMobile = useIsMobile();

  if (!user) return null;

  const initials = user.displayName.slice(0, 2).toUpperCase();
  const currentItem = sidebarItems.find(item =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  ) ?? sidebarItems[0];

  const tierColors: Record<string, string> = {
    base: "bg-muted text-muted-foreground",
    pro: "bg-primary/20 text-primary border border-primary/30",
    elite: "bg-accent/20 text-accent border border-accent/30",
  };

  const sidebar = (
    <nav className="space-y-1">
      {sidebarItems.map(item => {
        const isActive = item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to);
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              item.to === "/account/danger" && "text-destructive hover:text-destructive"
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Profile header */}
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <Avatar className="w-16 h-16">
            <AvatarFallback className="bg-primary/20 text-primary text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-foreground">{user.displayName}</h1>
              <Badge className={cn("text-[10px] font-mono uppercase", tierColors[tier])}>{tier}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <Calendar className="w-3 h-3" />
              Joined {formatNYDate(user.createdAt)}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/account">Edit Profile</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/account/subscription">Manage Subscription</Link>
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar — desktop: fixed left, mobile: dropdown */}
          {isMobile ? (
            <div className="w-full mb-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    <span className="flex items-center gap-2">
                      <currentItem.icon className="w-4 h-4" />
                      {currentItem.label}
                    </span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-[calc(100vw-2rem)]">
                  {sidebarItems.map(item => (
                    <DropdownMenuItem key={item.to} asChild>
                      <Link to={item.to} className="flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="w-56 shrink-0">
              <div className="sticky top-24 rounded-xl border border-border bg-card p-3">
                {sidebar}
              </div>
            </div>
          )}

          {/* Content area */}
          <div className={cn("flex-1 min-w-0", isMobile && "w-full")}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountLayout;
