import Navbar from "@/components/Navbar";
import { Check, X, Crown } from "lucide-react";
import { useUserTier, Tier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";

const features = [
  { name: "Basic match predictions", base: true, pro: true, elite: true },
  { name: "1 daily edge preview", base: true, pro: true, elite: true },
  { name: "Historical performance", base: true, pro: true, elite: true },
  { name: "Basic odds movement (open/current)", base: true, pro: true, elite: true },
  { name: "AI match insight", base: true, pro: true, elite: true },
  { name: "Full Edge Engine dashboard", base: false, pro: true, elite: true },
  { name: "Calculated Edge % with color coding", base: false, pro: true, elite: true },
  { name: "Smart money detection", base: false, pro: true, elite: true },
  { name: "Steam move alerts", base: false, pro: true, elite: true },
  { name: "Live probability updates", base: false, pro: true, elite: true },
  { name: "Confidence & volatility meters", base: false, pro: true, elite: true },
  { name: "Custom alert system", base: false, pro: true, elite: true },
  { name: "Bankroll manager (Kelly Criterion)", base: false, pro: true, elite: true },
  { name: "Full odds movement charts", base: false, pro: true, elite: true },
  { name: "All match analytics unlocked", base: false, pro: true, elite: true },
  { name: "Portfolio exposure view", base: false, pro: true, elite: true },
  { name: "Digital Twin (Team/Player/Coach)", base: false, pro: false, elite: true },
  { name: "Due Diligence Analysis", base: false, pro: false, elite: true },
  { name: "Octagon Radar Analytics", base: false, pro: false, elite: true },
  { name: "Confidence Brief + Risk Flags", base: false, pro: false, elite: true },
  { name: "Injury & News Intelligence", base: false, pro: false, elite: true },
  { name: "Coach Tendency Profiling", base: false, pro: false, elite: true },
  { name: "Compare Mode (Radar)", base: false, pro: false, elite: true },
  { name: "Sources & Model Interpretation", base: false, pro: false, elite: true },
];

const plans: { tier: Tier; name: string; price: number; description: string; badge?: string; features: string[] }[] = [
  {
    tier: "base", name: "Base", price: 0, description: "Get started with basic predictions",
    features: ["Basic predictions", "1 daily edge preview", "Historical performance", "Basic odds movement", "AI match insight"],
  },
  {
    tier: "pro", name: "Pro", price: 39, description: "Full analytics suite for serious bettors", badge: "RECOMMENDED",
    features: ["Everything in Base", "Full Edge Engine", "Smart money detection", "Live probability updates", "Custom alerts", "Bankroll manager", "All matches unlocked"],
  },
  {
    tier: "elite", name: "Elite", price: 99, description: "Deep research + digital twin + due diligence", badge: "MOST POWERFUL",
    features: ["Everything in Pro", "Digital Twin profiles", "Due Diligence reports", "Octagon Radar Analytics", "Risk Flags & Confidence Brief", "Injury & News intel", "Coach profiling", "Compare Mode"],
  },
];

const Pricing = () => {
  const { tier, setTier } = useUserTier();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Pricing</span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-2 mb-3">Choose Your Edge</h1>
            <p className="text-muted-foreground">Cancel anytime. 7-day free trial on Pro & Elite.</p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {plans.map(plan => {
              const isActive = tier === plan.tier;
              const isElite = plan.tier === "elite";
              return (
                <div key={plan.tier} className={cn(
                  "gradient-card rounded-xl border p-8 relative transition-all",
                  isActive ? "border-primary card-glow" : isElite ? "border-primary/50 shadow-[0_0_40px_hsl(175_85%_50%/0.12)]" : plan.badge ? "border-primary/40 card-glow" : "border-border"
                )}>
                  {plan.badge && (
                    <div className={cn(
                      "absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full",
                      isElite ? "bg-primary text-primary-foreground" : "gradient-primary text-primary-foreground"
                    )}>
                      {isElite && <Crown className="w-3 h-3 inline mr-1 -mt-0.5" />}
                      {plan.badge}
                    </div>
                  )}
                  <h3 className="text-lg font-semibold text-foreground mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="mb-6">
                    <span className="font-mono text-5xl font-bold text-foreground">${plan.price}</span>
                    <span className="text-muted-foreground text-sm">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setTier(plan.tier)}
                    className={cn(
                      "w-full py-3 rounded-lg font-semibold text-sm transition-all",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30 cursor-default"
                        : "gradient-primary text-primary-foreground hover:opacity-90"
                    )}
                  >
                    {isActive ? "Current Plan" : `Upgrade to ${plan.name}`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 text-center">Feature Comparison</h2>
            <div className="gradient-card rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-4 bg-secondary/50 px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <span>Feature</span>
                <span className="text-center">Base</span>
                <span className="text-center">Pro</span>
                <span className="text-center">Elite</span>
              </div>
              {features.map((f, i) => (
                <div key={f.name} className={cn("grid grid-cols-4 px-6 py-3 text-sm", i % 2 === 0 ? "bg-transparent" : "bg-secondary/20")}>
                  <span className="text-foreground">{f.name}</span>
                  {(["base", "pro", "elite"] as const).map(t => (
                    <span key={t} className="text-center">
                      {f[t] ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
