import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
}

const PricingCard = ({ name, price, description, features, popular }: PricingCardProps) => {
  return (
    <div className={`gradient-card rounded-xl border p-6 relative transition-all ${
      popular ? "border-primary card-glow scale-105" : "border-border hover:border-primary/30"
    }`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 gradient-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
          MOST POPULAR
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-1">{name}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      <div className="mb-6">
        <span className="font-mono text-4xl font-bold text-foreground">${price}</span>
        <span className="text-muted-foreground text-sm">/mo</span>
      </div>
      <ul className="space-y-3 mb-6">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-secondary-foreground">
            <Check className="w-4 h-4 text-primary flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      <Button className={`w-full ${popular ? "gradient-primary text-primary-foreground font-semibold" : ""}`} variant={popular ? "default" : "outline"}>
        Get Started
      </Button>
    </div>
  );
};

export default PricingCard;
