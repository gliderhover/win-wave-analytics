import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const AccountNotifications = () => {
  const { toast } = useToast();
  const [notifs, setNotifs] = useState({
    oddsMove: true,
    edgeThreshold: true,
    kickoff: false,
    simContest: true,
    communityReplies: true,
    communityMentions: true,
  });
  const [quietStart, setQuietStart] = useState("22:00");
  const [quietEnd, setQuietEnd] = useState("08:00");

  const toggle = (key: keyof typeof notifs) => setNotifs(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Email Notifications</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "oddsMove" as const, label: "Odds movement alerts", desc: "Get notified when tracked odds shift significantly" },
            { key: "edgeThreshold" as const, label: "Edge threshold alerts", desc: "When a match crosses your configured edge threshold" },
            { key: "kickoff" as const, label: "Kickoff reminders", desc: "30 minutes before matches in your watchlist" },
            { key: "simContest" as const, label: "Simulation contest updates", desc: "New contests, results, and leaderboard changes" },
            { key: "communityReplies" as const, label: "Community replies", desc: "When someone replies to your posts" },
            { key: "communityMentions" as const, label: "Community mentions", desc: "When you're mentioned in a post or comment" },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <Label className="text-sm">{n.label}</Label>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch checked={notifs[n.key]} onCheckedChange={() => toggle(n.key)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Push Notifications</CardTitle>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Browser push notifications will be available soon.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Quiet Hours</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Suppress non-critical notifications during these hours.</p>
          <div className="flex items-center gap-3">
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="time" value={quietStart} onChange={e => setQuietStart(e.target.value)} className="w-28" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="time" value={quietEnd} onChange={e => setQuietEnd(e.target.value)} className="w-28" />
            </div>
          </div>
          <Button size="sm" onClick={() => toast({ title: "Notification settings saved" })}>Save</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountNotifications;
