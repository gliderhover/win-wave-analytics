import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";

const AccountPreferences = () => {
  const { toast } = useToast();
  const [league, setLeague] = useState("all");
  const [tz, setTz] = useState("local");
  const [oddsFormat, setOddsFormat] = useState("decimal");
  const [defaultStake, setDefaultStake] = useState([5]);
  const [maxStake, setMaxStake] = useState([25]);
  const [reduceMotion, setReduceMotion] = useState(false);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Display Preferences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Default League Filter</Label>
              <Select value={league} onValueChange={setLeague}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Leagues</SelectItem>
                  <SelectItem value="last">Last Used</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone Display</Label>
              <Select value={tz} onValueChange={setTz}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="utc">UTC</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Odds Format</Label>
              <Select value={oddsFormat} onValueChange={setOddsFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="decimal">Decimal (1.85)</SelectItem>
                  <SelectItem value="fractional">Fractional (17/20)</SelectItem>
                  <SelectItem value="american">American (-118)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Simulation Risk Settings</CardTitle></CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-3">
            <Label>Default Stake: {defaultStake[0]}%</Label>
            <Slider value={defaultStake} onValueChange={setDefaultStake} min={1} max={20} step={1} />
            <div className="flex gap-2">
              {[1, 2, 5, 10].map(v => (
                <Button key={v} variant={defaultStake[0] === v ? "default" : "outline"} size="sm" className="text-xs" onClick={() => setDefaultStake([v])}>{v}%</Button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <Label>Max Stake Cap: {maxStake[0]}%</Label>
            <Slider value={maxStake} onValueChange={setMaxStake} min={5} max={50} step={5} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Accessibility</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Reduce Motion</Label>
              <p className="text-xs text-muted-foreground">Minimizes animations throughout the app</p>
            </div>
            <Switch checked={reduceMotion} onCheckedChange={setReduceMotion} />
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => toast({ title: "Preferences saved" })}>Save All Preferences</Button>
    </div>
  );
};

export default AccountPreferences;
