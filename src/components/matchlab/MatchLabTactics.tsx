import { useMemo, useState } from "react";
import { MatchData } from "@/lib/mockData";
import { useUserTier } from "@/contexts/UserTierContext";
import { getMatchLineup, getCoachProfile, getMatchTacticalSignals } from "@/lib/tacticsData";
import ProGate from "@/components/ProGate";
import PitchVisualization from "@/components/tactics/PitchVisualization";
import LineupPanel from "@/components/tactics/LineupPanel";
import InGameTimeline from "@/components/tactics/InGameTimeline";
import CoachProfileCard from "@/components/tactics/CoachProfileCard";
import TacticalSignals from "@/components/tactics/TacticalSignals";
import LineupVolatility from "@/components/tactics/LineupVolatility";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Crown, Info } from "lucide-react";

interface MatchLabTacticsProps {
  match: MatchData;
}

const MatchLabTactics = ({ match }: MatchLabTacticsProps) => {
  const { isElite } = useUserTier();
  const lineup = useMemo(() => getMatchLineup(match.id), [match.id]);
  const homeCoach = useMemo(() => getCoachProfile("brazil"), []);
  const awayCoach = useMemo(() => getCoachProfile("germany"), []);
  const tacticalData = useMemo(() => getMatchTacticalSignals(match.id), [match.id]);
  const [activeTab, setActiveTab] = useState("pregame");

  return (
    <ProGate label="Unlock Tactics & Formation Visualizer" requiredTier="pro">
      <Card className="border-border mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-mono flex items-center gap-2">
            ⚽ Tactics & Shape
            <Tooltip>
              <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
              <TooltipContent className="max-w-[250px]">
                <p className="text-xs">Formation analysis, coach tendencies, and tactical betting signals. In-Game timeline is Elite-only.</p>
              </TooltipContent>
            </Tooltip>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="pregame" className="text-xs font-mono">Pre-Game Lineups</TabsTrigger>
              <TabsTrigger value="ingame" className="text-xs font-mono flex items-center gap-1">
                In-Game Shape
                {!isElite && <Crown className="w-3 h-3 text-primary" />}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pregame">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PitchVisualization
                    homeFormation={lineup.homeFormation}
                    awayFormation={lineup.awayFormation}
                    homeTeam={match.teamA}
                    awayTeam={match.teamB}
                    homePressShape={lineup.homePressShape}
                    awayPressShape={lineup.awayPressShape}
                  />
                </div>
                <div className="space-y-4 lg:border-l lg:border-border lg:pl-4">
                  <LineupPanel formation={lineup.homeFormation} bench={lineup.homeBench} teamName={match.teamA} />
                  <div className="border-t border-border pt-4" />
                  <LineupPanel formation={lineup.awayFormation} bench={lineup.awayBench} teamName={match.teamB} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ingame">
              {isElite ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InGameTimeline shapeChanges={lineup.homeShapeChanges} teamName={match.teamA} initialFormation={lineup.homeFormation} />
                  <InGameTimeline shapeChanges={lineup.awayShapeChanges} teamName={match.teamB} initialFormation={lineup.awayFormation} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-secondary/30 border border-border rounded-lg p-4">
                    <h4 className="text-xs font-mono font-semibold text-foreground mb-2">Planned Adjustments</h4>
                    <p className="text-[10px] text-muted-foreground mb-3">Pro preview — upgrade to Elite for full in-game timeline.</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{match.teamA}</Badge>
                        <span className="text-[10px] text-foreground">Likely endgame: <span className="text-primary font-mono">5-4-1</span> if leading</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">{match.teamB}</Badge>
                        <span className="text-[10px] text-foreground">Likely endgame: <span className="text-primary font-mono">3-4-3</span> if trailing</span>
                      </div>
                    </div>
                  </div>
                  <ProGate label="Unlock full In-Game Shape Timeline" requiredTier="elite">
                    <div className="h-48 flex items-center justify-center text-muted-foreground text-xs">
                      Full timeline with minute slider, shape changes, and substitution impact analysis
                    </div>
                  </ProGate>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Coach Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono">Coach Profile — {match.teamA}</CardTitle>
          </CardHeader>
          <CardContent>
            <CoachProfileCard coach={homeCoach} />
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-mono">Coach Profile — {match.teamB}</CardTitle>
          </CardHeader>
          <CardContent>
            <CoachProfileCard coach={awayCoach} />
          </CardContent>
        </Card>
      </div>

      {/* Tactical Signals + Lineup Volatility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                🎯 Tactical Betting Signals
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">Each signal scores 0–100 based on tactical matchup analysis.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TacticalSignals signals={tacticalData.signals} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono">📋 Lineup Risk</CardTitle>
            </CardHeader>
            <CardContent>
              <LineupVolatility data={tacticalData.lineupVolatility} lastUpdate={tacticalData.lastUpdate} />
            </CardContent>
          </Card>
        </div>
      </div>
    </ProGate>
  );
};

export default MatchLabTactics;
