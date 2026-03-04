import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/contexts/UserTierContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { User, Trophy, Bell, MessageSquare } from "lucide-react";

const AccountProfile = () => {
  const { user } = useAuth();
  const { tier } = useUserTier();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [username, setUsername] = useState("@" + (user?.displayName?.toLowerCase().replace(/\s/g, "") ?? ""));
  const [timezone, setTimezone] = useState("local");
  const [country, setCountry] = useState("");

  if (!user) return null;

  const handleSave = () => {
    // TODO: persist to backend
    toast({ title: "Profile updated", description: "Your changes have been saved." });
  };

  return (
    <div className="space-y-6">
      {/* Quick tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: User, label: "Current Plan", value: tier.toUpperCase(), sub: "Renews Mar 2026" },
          { icon: Trophy, label: "Sim Bankroll", value: "$10,000", sub: "Rank #42" },
          { icon: Bell, label: "Active Alerts", value: "5", sub: "2 triggered today" },
          { icon: MessageSquare, label: "Community", value: "12 posts", sub: "48 comments" },
        ].map(t => (
          <Card key={t.label}>
            <CardContent className="p-4">
              <t.icon className="w-4 h-4 text-primary mb-2" />
              <div className="text-xs text-muted-foreground">{t.label}</div>
              <div className="font-mono text-lg font-bold text-foreground">{t.value}</div>
              <div className="text-[10px] text-muted-foreground">{t.sub}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Profile form */}
      <Card>
        <CardHeader><CardTitle className="text-base">Profile Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={displayName} onChange={e => setDisplayName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Username / Handle</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Country</Label>
              <Input placeholder="e.g. United States" value={country} onChange={e => setCountry(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local (auto-detect)</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="est">EST (UTC-5)</SelectItem>
                  <SelectItem value="cet">CET (UTC+1)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Avatar</Label>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
              <Button variant="outline" size="sm" disabled>Upload (coming soon)</Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Preferred Language</Label>
            <p className="text-xs text-muted-foreground">Use the language switcher in the navbar to change your language.</p>
          </div>

          <div className="space-y-2">
            <Label>Favorite Teams/Leagues</Label>
            <Input placeholder="e.g. Premier League, Barcelona, Bayern" />
            <p className="text-[10px] text-muted-foreground">Comma-separated. Used for personalized alerts and suggestions.</p>
          </div>

          <Button onClick={handleSave}>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountProfile;
