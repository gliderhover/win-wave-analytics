import Navbar from "@/components/Navbar";
import { Check, X } from "lucide-react";
import { useUserTier } from "@/contexts/UserTierContext";
import { cn } from "@/lib/utils";

const features = [
  { name: "Basic match predictions", free: true, pro: true },
  { name: "1 daily edge preview", free: true, pro: true },
  { name: "Historical performance", free: true, pro: true },
  { name: "Basic odds movement (open/current)", free: true, pro: true },
  { name: "AI match insight", free: true, pro: true },
  { name: "Full Edge Engine dashboard", free: false, pro: true },
  { name: "Calculated Edge % with color coding", free: false, pro: true },
  { name: "Smart money detection", free: false, pro: true },
  { name: "Steam move alerts", free: false, pro: true },
  { name: "Live probability updates", free: false, pro: true },
  { name: "Confidence & volatility meters", free: false, pro: true },
  { name: "Custom alert system", free: false, pro: true },
  { name: "Bankroll manager (Kelly Criterion)", free: false, pro: true },
  { name: "Full odds movement charts", free: false, pro: true },
  { name: "All match analytics unlocked", free: false, pro: true },
  { name: "Portfolio exposure view", free: false, pro: true },
];

const Pricing = () => {
  const { tier, setTier } = useUserTier();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Pricing</span>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground mt-2 mb-3">Choose Your Edge</h1>
            <p className="text-muted-foreground">Cancel anytime. 7-day free trial on Pro.</p>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            {/* Free */}
            <div className={cn(
              "gradient-card rounded-xl border p-8 transition-all",
              tier === "free" ? "border-primary card-glow" : "border-border"
            )}>
              <h3 className="text-lg font-semibold text-foreground mb-1">Free</h3>
              <p className="text-sm text-muted-foreground mb-4">Get started with basic predictions</p>
              <div className="mb-6">
                <span className="font-mono text-5xl font-bold text-foreground">$0</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                {["Basic predictions", "1 daily edge preview", "Historical performance", "Basic odds movement", "AI match insight"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setTier("free")}
                className={cn(
                  "w-full py-3 rounded-lg font-semibold text-sm transition-all",
                  tier === "free"
                    ? "bg-primary/20 text-primary border border-primary/30 cursor-default"
                    : "bg-secondary text-foreground hover:bg-secondary/80"
                )}
              >
                {tier === "free" ? "Current Plan" : "Switch to Free"}
              </button>
            </div>

            {/* Pro */}
            <div className={cn(
              "gradient-card rounded-xl border p-8 relative transition-all",
              tier === "pro" ? "border-primary card-glow" : "border-primary/40 card-glow"
            )}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                RECOMMENDED
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Pro</h3>
              <p className="text-sm text-muted-foreground mb-4">Full analytics suite for serious bettors</p>
              <div className="mb-6">
                <span className="font-mono text-5xl font-bold text-foreground">$39</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <ul className="space-y-3 mb-6">
                {["Everything in Free", "Full Edge Engine", "Smart money detection", "Live probability updates", "Custom alerts", "Bankroll manager", "All matches unlocked"].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-secondary-foreground">
                    <Check className="w-4 h-4 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setTier("pro")}
                className={cn(
                  "w-full py-3 rounded-lg font-semibold text-sm transition-all",
                  tier === "pro"
                    ? "bg-primary/20 text-primary border border-primary/30 cursor-default"
                    : "gradient-primary text-primary-foreground hover:opacity-90"
                )}
              >
                {tier === "pro" ? "Current Plan" : "Upgrade to Pro"}
              </button>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-4 text-center">Feature Comparison</h2>
            <div className="gradient-card rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-3 bg-secondary/50 px-6 py-3 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <span>Feature</span>
                <span className="text-center">Free</span>
                <span className="text-center">Pro</span>
              </div>
              {features.map((f, i) => (
                <div key={f.name} className={cn("grid grid-cols-3 px-6 py-3 text-sm", i % 2 === 0 ? "bg-transparent" : "bg-secondary/20")}>
                  <span className="text-foreground">{f.name}</span>
                  <span className="text-center">
                    {f.free ? <Check className="w-4 h-4 text-primary mx-auto" /> : <X className="w-4 h-4 text-muted-foreground/40 mx-auto" />}
                  </span>
                  <span className="text-center">
                    <Check className="w-4 h-4 text-primary mx-auto" />
                  </span>
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
