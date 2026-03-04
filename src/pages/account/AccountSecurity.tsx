import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, Smartphone, Monitor, LogOut } from "lucide-react";

const AccountSecurity = () => {
  const { toast } = useToast();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  const handleChangePassword = () => {
    if (newPw.length < 6) return toast({ title: "Password too short", variant: "destructive" });
    if (newPw !== confirmPw) return toast({ title: "Passwords don't match", variant: "destructive" });
    // TODO: wire to backend
    toast({ title: "Password updated" });
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
  };

  const sessions = [
    { device: "Chrome on macOS", icon: Monitor, location: "New York, US", current: true, lastActive: "Now" },
    { device: "Safari on iPhone", icon: Smartphone, location: "New York, US", current: false, lastActive: "2h ago" },
  ];

  const loginHistory = [
    { date: "Mar 3, 2026 14:22", ip: "192.168.1.x", location: "New York, US", status: "Success" },
    { date: "Mar 2, 2026 09:11", ip: "192.168.1.x", location: "New York, US", status: "Success" },
    { date: "Mar 1, 2026 18:45", ip: "10.0.0.x", location: "London, UK", status: "Failed" },
  ];

  return (
    <div className="space-y-6">
      {/* Change password */}
      <Card>
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleChangePassword}>Update Password</Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Two-Factor Authentication</CardTitle>
            <Badge variant="outline" className="text-xs">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Add an extra layer of security to your account using an authenticator app.</p>
          <Button variant="outline" size="sm" className="mt-3" disabled>Enable 2FA</Button>
        </CardContent>
      </Card>

      {/* Active sessions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Active Sessions</CardTitle>
            <Button variant="destructive" size="sm" onClick={() => toast({ title: "All other sessions logged out" })}>
              <LogOut className="w-3 h-3 mr-1" /> Log Out All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="flex items-center gap-3">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-foreground">{s.device}</div>
                  <div className="text-xs text-muted-foreground">{s.location} · {s.lastActive}</div>
                </div>
              </div>
              {s.current ? (
                <Badge className="bg-primary/20 text-primary text-[10px]">Current</Badge>
              ) : (
                <Button variant="ghost" size="sm" className="text-xs text-destructive">Revoke</Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Login history */}
      <Card>
        <CardHeader><CardTitle className="text-base">Login History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {loginHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between text-sm p-2 rounded bg-secondary/30">
                <span className="text-muted-foreground font-mono text-xs">{h.date}</span>
                <span className="text-muted-foreground text-xs">{h.location}</span>
                <Badge variant={h.status === "Success" ? "outline" : "destructive"} className="text-[10px]">
                  {h.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSecurity;
