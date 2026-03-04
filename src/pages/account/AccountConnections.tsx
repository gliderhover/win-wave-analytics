import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link2, MessageCircle, Key } from "lucide-react";

const connections = [
  { name: "Google", desc: "Sign in with Google", icon: Link2, connected: false, comingSoon: true },
  { name: "Discord", desc: "Get alerts in your Discord server", icon: MessageCircle, connected: false, comingSoon: true },
  { name: "Slack", desc: "Push notifications to Slack channels", icon: MessageCircle, connected: false, comingSoon: true },
];

const AccountConnections = () => (
  <div className="space-y-6">
    <Card>
      <CardHeader><CardTitle className="text-base">Connected Accounts</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {connections.map(c => (
          <div key={c.name} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
            <div className="flex items-center gap-3">
              <c.icon className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-foreground">{c.name}</div>
                <div className="text-xs text-muted-foreground">{c.desc}</div>
              </div>
            </div>
            {c.comingSoon ? (
              <Badge variant="outline" className="text-xs">Coming Soon</Badge>
            ) : (
              <Button variant={c.connected ? "destructive" : "outline"} size="sm">
                {c.connected ? "Disconnect" : "Connect"}
              </Button>
            )}
          </div>
        ))}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">API Access</CardTitle>
          <Badge className="bg-accent/20 text-accent text-[10px] font-mono uppercase">Elite Only</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Key className="w-5 h-5" />
          <span>API access keys will be available for Elite subscribers.</span>
        </div>
        <Button variant="outline" size="sm" className="mt-3" disabled>Generate API Key</Button>
      </CardContent>
    </Card>
  </div>
);

export default AccountConnections;
