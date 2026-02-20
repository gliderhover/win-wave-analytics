import { Activity, Brain, BarChart3, Zap, Shield, LineChart, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import MatchCard from "@/components/MatchCard";
import FeatureCard from "@/components/FeatureCard";
import PricingCard from "@/components/PricingCard";

const matches = [
  { teamA: "Brazil", teamB: "Germany", flagA: "🇧🇷", flagB: "🇩🇪", probA: 48, probDraw: 26, probB: 26, signal: "bullish" as const, smartMoney: "Heavy on Brazil", kickoff: "Jun 15 • 18:00 UTC" },
  { teamA: "Argentina", teamB: "France", flagA: "🇦🇷", flagB: "🇫🇷", probA: 42, probDraw: 28, probB: 30, signal: "neutral" as const, smartMoney: "Split market", kickoff: "Jun 16 • 20:00 UTC" },
  { teamA: "Spain", teamB: "England", flagA: "🇪🇸", flagB: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", probA: 38, probDraw: 30, probB: 32, signal: "bearish" as const, smartMoney: "Fading Spain", kickoff: "Jun 17 • 15:00 UTC" },
  { teamA: "Portugal", teamB: "Netherlands", flagA: "🇵🇹", flagB: "🇳🇱", probA: 44, probDraw: 28, probB: 28, signal: "bullish" as const, smartMoney: "Value on Portugal", kickoff: "Jun 18 • 18:00 UTC" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(175_85%_50%/0.06),transparent_60%)]" />
        <div className="container mx-auto text-center relative">
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full mb-6 border border-primary/20">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              LIVE — 12 matches tracked
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-foreground mb-6 animate-slide-up-delay-1 leading-tight">
            World Cup Betting<br />
            <span className="text-glow text-primary">Intelligence</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 animate-slide-up-delay-2">
            AI-powered match predictions, live probability shifts, and smart money tracking. 
            The edge serious bettors need.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up-delay-3">
            <Link to="/dashboard" className="gradient-primary text-primary-foreground font-bold px-8 py-3.5 rounded-lg text-lg hover:opacity-90 transition-opacity flex items-center gap-2">
              Start 7-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-mono">
              View live demo →
            </Link>
          </div>

          {/* Stats bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "73.2%", label: "Hit Rate" },
              { value: "2,847", label: "Active Users" },
              { value: "156", label: "Matches Analyzed" },
              { value: "+18.4%", label: "Avg ROI" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-2xl md:text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Dashboard Preview */}
      <section id="dashboard" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Live Preview</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Today's Signals</h2>
            <p className="text-muted-foreground mt-2">Real-time AI predictions for upcoming matches</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {matches.map((match, i) => (
              <MatchCard key={i} {...match} />
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Platform</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Your Unfair Advantage</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={Brain} title="AI Match Predictor" description="Deep learning models trained on 20+ years of international football data, updated in real-time." stat="73.2%" statLabel="accuracy" />
            <FeatureCard icon={LineChart} title="Live Odds Tracker" description="Monitor probability shifts across 40+ sportsbooks. Spot value before the market corrects." stat="<2s" statLabel="update latency" />
            <FeatureCard icon={Zap} title="Smart Money Alerts" description="Know where sharp bettors are placing their money. Instant push notifications for line movements." stat="156" statLabel="signals/day" />
            <FeatureCard icon={BarChart3} title="Historical Matchups" description="Comprehensive H2H data, venue performance, referee tendencies, and weather impact analysis." />
            <FeatureCard icon={Shield} title="Bankroll Manager" description="AI-optimized stake sizing based on Kelly Criterion. Protect your capital with dynamic risk limits." />
            <FeatureCard icon={Activity} title="Performance Analytics" description="Track your betting history, ROI trends, and identify your strongest markets and weaknesses." />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4 border-t border-border">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-mono text-primary uppercase tracking-wider">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">Choose Your Edge</h2>
            <p className="text-muted-foreground mt-2">Cancel anytime. 7-day free trial on all plans.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto items-start">
            <PricingCard name="Starter" price={29} description="Essential signals" features={["AI match predictions", "Daily signal alerts", "Basic matchup data", "Email support"]} />
            <PricingCard name="Pro" price={59} description="Full analytics suite" popular features={["Everything in Starter", "Live odds tracker", "Smart money indicators", "Bankroll manager", "Priority alerts", "API access"]} />
            <PricingCard name="Elite" price={99} description="Maximum edge" features={["Everything in Pro", "Custom AI models", "1-on-1 strategy calls", "Arbitrage scanner", "White-glove onboarding", "Dedicated Slack channel"]} />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <span className="font-bold text-foreground">BetIQ</span>
          </div>
          <p className="text-xs text-muted-foreground text-center max-w-lg">
            For entertainment and informational purposes only. BetIQ does not facilitate gambling. 
            Please gamble responsibly and comply with your local jurisdiction's laws.
          </p>
          <div className="text-xs text-muted-foreground">© 2026 BetIQ</div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
