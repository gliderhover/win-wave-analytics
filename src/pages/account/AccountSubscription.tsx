import { useState } from "react";
import { useUserTier, Tier } from "@/contexts/UserTierContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CreditCard, Check, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const plans: { tier: Tier; name: string; price: string; features: string[] }[] = [
  { tier: "base", name: "Base", price: "Free", features: ["Basic probabilities", "Limited match access", "10 sim bets/week"] },
  { tier: "pro", name: "Pro", price: "$39/mo", features: ["Edge Engine", "Smart Money Dashboard", "Unlimited sim bets", "Bankroll Manager"] },
  { tier: "elite", name: "Elite", price: "$99/mo", features: ["Everything in Pro", "Digital Twin profiles", "DD Match Reports", "Octagon Radar"] },
];

const invoices = [
  { date: "Feb 1, 2026", amount: "$39.00", status: "Paid" },
  { date: "Jan 1, 2026", amount: "$39.00", status: "Paid" },
  { date: "Dec 1, 2025", amount: "$39.00", status: "Paid" },
];

const AccountSubscription = () => {
  const { tier, setTier } = useUserTier();
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="space-y-6">
      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Current Plan</CardTitle>
            <Badge className="bg-primary/20 text-primary font-mono uppercase text-xs">{tier}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Billing: <strong className="text-foreground">{billing === "monthly" ? "Monthly" : "Yearly"}</strong></span>
            <span>Next renewal: <strong className="text-foreground">Apr 1, 2026</strong></span>
          </div>
          <div className="flex gap-2 mt-3">
            <Button variant={billing === "monthly" ? "default" : "outline"} size="sm" onClick={() => setBilling("monthly")}>Monthly</Button>
            <Button variant={billing === "yearly" ? "default" : "outline"} size="sm" onClick={() => setBilling("yearly")}>Yearly (save 20%)</Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map(plan => (
          <Card key={plan.tier} className={cn(plan.tier === tier && "border-primary")}>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{plan.name}</h3>
                <span className="font-mono text-primary text-sm">{plan.price}</span>
              </div>
              <ul className="space-y-1.5">
                {plan.features.map(f => (
                  <li key={f} className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Check className="w-3 h-3 text-primary" /> {f}
                  </li>
                ))}
              </ul>
              {plan.tier === tier ? (
                <Button variant="outline" size="sm" className="w-full" disabled>Current Plan</Button>
              ) : (
                <Button size="sm" className="w-full" onClick={() => { setTier(plan.tier); toast({ title: `Switched to ${plan.name}` }); }}>
                  {plans.findIndex(p => p.tier === plan.tier) > plans.findIndex(p => p.tier === tier) ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment method */}
      <Card>
        <CardHeader><CardTitle className="text-base">Payment Method</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm">
            <CreditCard className="w-5 h-5 text-muted-foreground" />
            <span className="text-muted-foreground">•••• •••• •••• 4242</span>
            <Badge variant="outline" className="text-[10px]">Visa</Badge>
          </div>
          <Button variant="outline" size="sm" disabled>Update (coming soon)</Button>
        </CardContent>
      </Card>

      {/* Invoices */}
      <Card>
        <CardHeader><CardTitle className="text-base">Invoices</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {invoices.map((inv, i) => (
            <div key={i} className="flex items-center justify-between p-2 rounded bg-secondary/30 text-sm">
              <span className="text-muted-foreground font-mono text-xs">{inv.date}</span>
              <span className="text-foreground">{inv.amount}</span>
              <Badge variant="outline" className="text-[10px]">{inv.status}</Badge>
              <Button variant="ghost" size="sm" className="text-xs"><FileText className="w-3 h-3 mr-1" /> PDF</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Cancel */}
      <Card className="border-destructive/30">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Cancel Subscription</h3>
            <p className="text-xs text-muted-foreground">You'll keep access until the end of your billing period.</p>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Cancel Plan</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll be downgraded to the Base plan at the end of your current billing period. This action can be reversed by resubscribing.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep Plan</AlertDialogCancel>
                <AlertDialogAction onClick={() => { setTier("base"); toast({ title: "Subscription cancelled" }); }}>
                  Confirm Cancellation
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSubscription;
