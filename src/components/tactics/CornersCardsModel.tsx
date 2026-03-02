import { useMemo } from "react";
import { getMatchCornersCards, MatchCornersCards } from "@/lib/cornersCardsData";
import { useUserTier } from "@/contexts/UserTierContext";
import ProGate from "@/components/ProGate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Info, RefreshCw, CornerDownRight, CreditCard, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CornersCardsModelProps {
  matchId: string;
  teamA: string;
  teamB: string;
}

const ScoreBar = ({ label, score, color }: { label: string; score: number; color?: string }) => (
  <div className="space-y-0.5">
    <div className="flex justify-between text-[10px]">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground">{score}</span>
    </div>
    <Progress value={score} className={cn("h-1", color)} />
  </div>
);

const CornersCardsModel = ({ matchId, teamA, teamB }: CornersCardsModelProps) => {
  const { isElite } = useUserTier();
  const data = useMemo(() => getMatchCornersCards(matchId), [matchId]);

  return (
    <ProGate label="Unlock Corners & Cards Model" requiredTier="pro">
      <div className="space-y-6">
        {/* Risk Flags Banner */}
        <Card className="border-border bg-destructive/5 border-destructive/20">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
              <span className="text-xs font-mono font-semibold text-foreground">Set Piece & Discipline Risk Flags</span>
              <Button variant="ghost" size="icon" className="h-5 w-5 ml-auto" onClick={() => toast.success("Data refreshed")}>
                <RefreshCw className="w-3 h-3 text-muted-foreground" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {data.riskFlags.map((f, i) => (
                <Badge key={i} variant="outline" className="text-[9px] bg-destructive/10 text-destructive border-destructive/20">
                  {f}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Corners Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <CornerDownRight className="w-4 h-4 text-primary" />
                Corners Insights
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">Predicted corners based on tactical width, crossing volume, and pressing patterns.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Predicted Range */}
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Predicted Corners</div>
                <div className="font-mono text-2xl font-bold text-primary">
                  {data.corners.predictedRange[0]}–{data.corners.predictedRange[1]}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Confidence: <span className="font-mono text-foreground">{data.corners.confidence}%</span>
                </div>
              </div>

              {/* Team Tendencies */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">{teamA.toUpperCase()} TENDENCIES</h5>
                <ScoreBar label="Cross Volume" score={data.corners.homeCornerTendency.crossVolume} />
                <ScoreBar label="Wing Play" score={data.corners.homeCornerTendency.wingPlay} />
                <ScoreBar label="Press Intensity" score={data.corners.homeCornerTendency.pressingIntensity} />
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.corners.homeCornerTendency.attackStyleTags.map(t => (
                    <Badge key={t} variant="outline" className="text-[8px]">{t}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">{teamB.toUpperCase()} TENDENCIES</h5>
                <ScoreBar label="Cross Volume" score={data.corners.awayCornerTendency.crossVolume} />
                <ScoreBar label="Wing Play" score={data.corners.awayCornerTendency.wingPlay} />
                <ScoreBar label="Press Intensity" score={data.corners.awayCornerTendency.pressingIntensity} />
                <div className="flex flex-wrap gap-1 mt-2">
                  {data.corners.awayCornerTendency.attackStyleTags.map(t => (
                    <Badge key={t} variant="outline" className="text-[8px]">{t}</Badge>
                  ))}
                </div>
              </div>

              {/* Market Lens */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">MARKET LENS</h5>
                <div className="flex flex-wrap gap-1">
                  {data.corners.marketLens.map(m => (
                    <Badge key={m} className="text-[9px] bg-primary/15 text-primary border-primary/30">{m}</Badge>
                  ))}
                </div>
              </div>

              {/* Rationale */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">WHY</h5>
                <ul className="space-y-1">
                  {data.corners.rationale.map((r, i) => (
                    <li key={i} className="text-[10px] text-foreground/80 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Scenarios (Elite) */}
              {isElite && (
                <div>
                  <h5 className="text-[10px] font-mono text-muted-foreground mb-2">SCENARIOS</h5>
                  <div className="space-y-1.5">
                    {data.corners.scenarios.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5">
                        <Badge variant="outline" className="text-[8px] shrink-0">{s.trigger}</Badge>
                        <span className="text-[10px] text-primary font-mono">{s.effect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cards Card */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-destructive" />
                Cards Insights
                <Tooltip>
                  <TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger>
                  <TooltipContent className="max-w-[250px]">
                    <p className="text-xs">Predicted cards based on press intensity, discipline scores, and referee profile.</p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Predicted Range */}
              <div className="bg-secondary/50 rounded-lg p-3 text-center">
                <div className="text-xs text-muted-foreground mb-1">Predicted Cards</div>
                <div className="font-mono text-2xl font-bold text-destructive">
                  {data.cards.predictedRange[0]}–{data.cards.predictedRange[1]}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Confidence: <span className="font-mono text-foreground">{data.cards.confidence}%</span>
                </div>
              </div>

              {/* Discipline Scores */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">DISCIPLINE RISK</h5>
                <ScoreBar label={`${teamA} Risk`} score={data.cards.homeDisciplineScore} />
                <ScoreBar label={`${teamB} Risk`} score={data.cards.awayDisciplineScore} />
              </div>

              {/* Drivers */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">DISCIPLINE DRIVERS</h5>
                <ScoreBar label="Press Intensity" score={data.cards.disciplineDrivers.pressIntensity} />
                <ScoreBar label="Defensive Line Stress" score={data.cards.disciplineDrivers.defensiveLineStress} />
                <ScoreBar label="Rivalry Intensity" score={data.cards.disciplineDrivers.rivalryIntensity} />
                <ScoreBar label="Foul Propensity" score={data.cards.disciplineDrivers.foulPropensity} />
              </div>

              {/* Referee (Elite placeholder) */}
              <div className="bg-secondary/30 rounded-lg p-2.5">
                <h5 className="text-[10px] font-mono text-muted-foreground mb-1">REFEREE FACTOR</h5>
                <div className="text-xs text-foreground">{data.cards.refereeFactor.name}</div>
                <div className="flex gap-3 mt-1 text-[10px] font-mono text-muted-foreground">
                  <span>Avg cards/match: <span className="text-foreground">{data.cards.refereeFactor.cardsPerMatch}</span></span>
                  <span>Strictness: <span className="text-foreground">{data.cards.refereeFactor.strictnessRating}/100</span></span>
                </div>
              </div>

              {/* Market Lens */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">MARKET LENS</h5>
                <div className="flex flex-wrap gap-1">
                  {data.cards.marketLens.map(m => (
                    <Badge key={m} className="text-[9px] bg-destructive/15 text-destructive border-destructive/30">{m}</Badge>
                  ))}
                </div>
              </div>

              {/* Rationale */}
              <div>
                <h5 className="text-[10px] font-mono text-muted-foreground mb-2">WHY</h5>
                <ul className="space-y-1">
                  {data.cards.rationale.map((r, i) => (
                    <li key={i} className="text-[10px] text-foreground/80 flex items-start gap-1.5">
                      <span className="text-destructive mt-0.5">•</span>{r}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Player Card Risks (Elite) */}
              {isElite && (
                <div>
                  <h5 className="text-[10px] font-mono text-muted-foreground mb-2">PLAYER CARD RISK (TOP 5)</h5>
                  <div className="space-y-1.5">
                    {data.cards.playerCardRisks.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5">
                        <span className="text-[10px] font-semibold text-foreground w-20 truncate">{p.name}</span>
                        <Badge variant="outline" className="text-[8px]">{p.position}</Badge>
                        <span className="text-[9px] text-muted-foreground flex-1">{p.role}</span>
                        <div className="flex items-center gap-1">
                          <Progress value={p.riskScore} className="h-1 w-12" />
                          <span className={cn(
                            "text-[10px] font-mono",
                            p.riskScore >= 70 ? "text-destructive" : p.riskScore >= 50 ? "text-warning" : "text-muted-foreground"
                          )}>{p.riskScore}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Scenarios (Elite) */}
              {isElite && (
                <div>
                  <h5 className="text-[10px] font-mono text-muted-foreground mb-2">SCENARIOS</h5>
                  <div className="space-y-1.5">
                    {data.cards.scenarios.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 bg-secondary/30 rounded px-2 py-1.5">
                        <Badge variant="outline" className="text-[8px] shrink-0">{s.trigger}</Badge>
                        <span className="text-[10px] text-destructive font-mono">{s.effect}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProGate>
  );
};

export default CornersCardsModel;
