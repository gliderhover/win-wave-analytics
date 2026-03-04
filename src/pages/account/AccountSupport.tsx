import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { HelpCircle, Bug, Lightbulb, ExternalLink } from "lucide-react";

const AccountSupport = () => {
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!subject || !category || !message) return toast({ title: "Please fill all fields", variant: "destructive" });
    toast({ title: "Support ticket submitted", description: "We'll get back to you within 24 hours." });
    setSubject(""); setCategory(""); setMessage("");
  };

  return (
    <div className="space-y-6">
      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: HelpCircle, label: "Help Center", desc: "Browse FAQs and guides", href: "#" },
          { icon: ExternalLink, label: "Community Guidelines", desc: "Rules and best practices", href: "#" },
          { icon: ExternalLink, label: "Terms & Privacy", desc: "Legal documents", href: "#" },
        ].map(l => (
          <Card key={l.label} className="cursor-pointer hover:border-primary/30 transition-colors">
            <CardContent className="p-4 flex items-start gap-3">
              <l.icon className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <div className="text-sm font-medium text-foreground">{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.desc}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact support */}
      <Card>
        <CardHeader><CardTitle className="text-base">Contact Support</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Brief description" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="account">Account</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue in detail" rows={5} />
          </div>
          <p className="text-[10px] text-muted-foreground">App v1.0.0 · Page: {window.location.pathname}</p>
          <Button onClick={handleSubmit}>Submit Ticket</Button>
        </CardContent>
      </Card>

      {/* Report bug & feature request */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <Bug className="w-5 h-5 text-destructive" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Report a Bug</div>
              <div className="text-xs text-muted-foreground">Help us improve by reporting issues</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Bug report form", description: "Coming soon!" })}>Report</Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">Feature Request</div>
              <div className="text-xs text-muted-foreground">Suggest new features or improvements</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => toast({ title: "Feature request form", description: "Coming soon!" })}>Suggest</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AccountSupport;
