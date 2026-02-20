import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stat?: string;
  statLabel?: string;
}

const FeatureCard = ({ icon: Icon, title, description, stat, statLabel }: FeatureCardProps) => {
  return (
    <div className="gradient-card rounded-xl border border-border p-6 card-glow hover:border-primary/30 transition-all group">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{description}</p>
      {stat && (
        <div className="pt-3 border-t border-border">
          <span className="font-mono text-2xl font-bold text-primary">{stat}</span>
          <span className="text-xs text-muted-foreground ml-2">{statLabel}</span>
        </div>
      )}
    </div>
  );
};

export default FeatureCard;
