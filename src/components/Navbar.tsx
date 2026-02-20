import { Activity } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg text-foreground">BetIQ</span>
          <span className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">PRO</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#dashboard" className="hover:text-foreground transition-colors">Dashboard</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">Log in</button>
          <button className="text-sm gradient-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
            Start Free Trial
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
