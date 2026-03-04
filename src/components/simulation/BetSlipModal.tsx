import { useState } from "react";
import { ScheduleMatch } from "@/lib/scheduleData";
import { useUserTier } from "@/contexts/UserTierContext";
import { useI18n } from "@/i18n/I18nContext";
import { SimulationState, placeBet, impliedToDecimal, VIRTUAL_CURRENCY } from "@/lib/simulationData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { AlertTriangle, TrendingUp, Coins } from "lucide-react";
import { toast } from "sonner";

interface BetSlipModalProps {
  open: boolean;
  onClose: () => void;
  match: ScheduleMatch;
  simState: SimulationState;
  onBetPlaced: (newState: SimulationState) => void;
}

const BetSlipModal = ({ open, onClose, match, simState, onBetPlaced }: BetSlipModalProps) => {
  const { isPro, isElite } = useUserTier();
  const { t } = useI18n();
  const [selection, setSelection] = useState<"home" | "draw" | "away">("home");
  const [stakeStr, setStakeStr] = useState("");

  const selections = [
    { key: "home" as const, label: `${match.teamHome} ${t("common.win")}` },
    { key: "draw" as const, label: t("common.draw") },
    { key: "away" as const, label: `${match.teamAway} ${t("common.win")}` },
  ];

  const stake = parseFloat(stakeStr) || 0;
  const maxStake = +(simState.bankroll * simState.maxStakePct / 100).toFixed(2);

  const getImplied = (sel: "home" | "draw" | "away") =>
    sel === "home" ? match.marketImplied.home : sel === "draw" ? match.marketImplied.draw : match.marketImplied.away;
  const getModelProb = (sel: "home" | "draw" | "away") =>
    sel === "home" ? match.modelProbs.home : sel === "draw" ? match.modelProbs.draw : match.modelProbs.away;

  const implied = getImplied(selection);
  const decimalOdds = impliedToDecimal(implied);
  const modelProb = getModelProb(selection);
  const edge = modelProb - implied;
  const potentialPayout = +(stake * decimalOdds).toFixed(2);
  const potentialROI = stake > 0 ? +(((potentialPayout - stake) / stake) * 100).toFixed(1) : 0;
  const quickPcts = [1, 2, 5, 10];
  const canPlace = stake > 0 && stake <= maxStake && stake <= simState.bankroll;

  const handlePlace = () => {
    if (!canPlace) return;
    const newState = placeBet(simState, match, selection, stake);
    onBetPlaced(newState);
    const selLabel = selections.find(s => s.key === selection)?.label ?? "";
    toast.success(t("betSlip.betPlaced", { selection: selLabel, odds: String(decimalOdds.toFixed(2)) }));
    setStakeStr("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="gradient-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Coins className="w-5 h-5 text-primary" />
            {t("betSlip.title")}
          </DialogTitle>
          <p className="text-[10px] text-signal-neutral font-mono">{t("simulation.disclaimer")}</p>
        </DialogHeader>

        <div className="bg-secondary/50 rounded-lg p-3 flex items-center gap-2 text-sm">
          <span>{match.flagHome}</span>
          <span className="font-semibold text-foreground">{match.teamHome}</span>
          <span className="text-muted-foreground text-xs">{t("common.vs")}</span>
          <span className="font-semibold text-foreground">{match.teamAway}</span>
          <span>{match.flagAway}</span>
          <Badge variant="outline" className="text-[8px] ml-auto">{match.league}</Badge>
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">{match.kickoffDate} • {match.kickoffLocal}</div>

        <div>
          <div className="text-xs text-muted-foreground mb-2 font-semibold">{t("betSlip.market1x2")}</div>
          <div className="grid grid-cols-3 gap-2">
            {selections.map(s => {
              const imp = getImplied(s.key);
              const odds = impliedToDecimal(imp);
              const mp = getModelProb(s.key);
              const e = mp - imp;
              return (
                <button key={s.key} onClick={() => setSelection(s.key)}
                  className={cn("rounded-lg border p-2 text-center transition-all",
                    selection === s.key ? "border-primary bg-primary/10" : "border-border bg-secondary/30 hover:border-primary/30"
                  )}>
                  <div className="text-xs font-semibold text-foreground">{s.label}</div>
                  <div className="font-mono text-lg font-bold text-primary">{odds.toFixed(2)}</div>
                  <div className="text-[9px] text-muted-foreground">{imp.toFixed(0)}% {t("common.implied")}</div>
                  {e >= 2 && (
                    <Badge variant="outline" className="text-[8px] mt-1 bg-signal-bullish/10 text-signal-bullish border-signal-bullish/30">+{e.toFixed(1)}%</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-secondary/30 rounded-lg p-3 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("betSlip.modelProbability")}:</span>
            <span className="font-mono text-foreground">{modelProb.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">{t("betSlip.edge")}:</span>
            <span className={cn("font-mono", edge >= 2 ? "text-signal-bullish" : edge > 0 ? "text-foreground" : "text-signal-bearish")}>
              {edge >= 0 ? "+" : ""}{edge.toFixed(1)}%
            </span>
          </div>
          {isElite && edge >= 4 && (
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3 text-primary" />
              <span className="text-primary text-[10px]">{t("betSlip.eliteConfidence")}</span>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-semibold">{t("betSlip.stake")} ({VIRTUAL_CURRENCY})</span>
            <span className="text-[10px] text-muted-foreground">{t("common.bankroll")}: <span className="text-foreground font-mono">{simState.bankroll.toLocaleString()}</span></span>
          </div>
          <Input type="number" value={stakeStr} onChange={e => setStakeStr(e.target.value)}
            placeholder={t("betSlip.enterStake")} className="bg-secondary border-border font-mono" min={0} max={maxStake} />
          <div className="flex gap-1.5 mt-2">
            {quickPcts.map(p => (
              <button key={p} onClick={() => setStakeStr((simState.bankroll * p / 100).toFixed(0))}
                className="text-[10px] font-mono px-2.5 py-1 rounded-md bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors">
                {p}%
              </button>
            ))}
          </div>
          {stake > maxStake && (
            <div className="flex items-center gap-1 mt-2 text-signal-bearish text-[10px]">
              <AlertTriangle className="w-3 h-3" />
              {t("betSlip.maxStake", { max: String(maxStake.toLocaleString()), pct: String(simState.maxStakePct) })}
            </div>
          )}
        </div>

        {stake > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{t("betSlip.estimatedPayout")}</div>
              <div className="font-mono text-lg font-bold text-foreground">{potentialPayout.toLocaleString()}</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2 text-center">
              <div className="text-[10px] text-muted-foreground">{t("betSlip.potentialROI")}</div>
              <div className="font-mono text-lg font-bold text-signal-bullish">+{potentialROI}%</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={handlePlace} disabled={!canPlace} className="flex-1 gradient-primary text-primary-foreground font-semibold">{t("betSlip.placeBet")}</Button>
          <Button variant="outline" onClick={onClose} className="px-4">{t("common.cancel")}</Button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center">{t("betSlip.footerDisclaimer")}</p>
      </DialogContent>
    </Dialog>
  );
};

export default BetSlipModal;
