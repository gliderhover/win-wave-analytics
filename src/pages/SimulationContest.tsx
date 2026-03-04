import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n/I18nContext";
import { mockContests, getSimulationState, saveSimulationState, SimulationState } from "@/lib/simulationData";
import { cn } from "@/lib/utils";
import { Trophy, Calendar, Users, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const SimulationContest = () => {
  const [simState, setSimState] = useState<SimulationState>(getSimulationState);
  const { t } = useI18n();

  const joinContest = (contestId: string) => {
    if (simState.contestEntries.includes(contestId)) {
      toast.info("Already joined this contest");
      return;
    }
    const next = { ...simState, contestEntries: [...simState.contestEntries, contestId] };
    saveSimulationState(next);
    setSimState(next);
    toast.success("Joined contest! Good luck 🎉");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <Link to="/simulation" className="flex items-center gap-1 text-xs text-primary font-mono mb-4 hover:underline">
            <ArrowLeft className="w-3 h-3" /> {t("contest.backToSim")}
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("contest.title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">{t("contest.subtitle")}</p>

          <div className="space-y-4">
            {mockContests.map(c => {
              const joined = simState.contestEntries.includes(c.id);
              return (
                <div key={c.id} className={cn(
                  "gradient-card rounded-xl border p-6",
                  c.type === "annual" ? "border-primary/30 card-glow" : "border-border"
                )}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">{c.name}</h3>
                      <Badge variant="outline" className={cn("text-[9px]",
                        c.type === "weekly" ? "bg-primary/10 text-primary border-primary/30" :
                        c.type === "monthly" ? "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30" :
                        "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30"
                      )}>{c.type}</Badge>
                      <Badge variant="outline" className={cn("text-[9px]",
                        c.status === "active" ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30" :
                        c.status === "upcoming" ? "bg-secondary text-muted-foreground" :
                        "bg-muted text-muted-foreground"
                      )}>{c.status}</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{t("contest.start")}</div>
                      <div className="text-xs font-mono text-foreground">{c.startDate}</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{t("contest.end")}</div>
                      <div className="text-xs font-mono text-foreground">{c.endDate}</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1"><Users className="w-3 h-3" />{t("contest.participants")}</div>
                      <div className="text-xs font-mono text-foreground">{c.participants.toLocaleString()}</div>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-2">
                      <div className="text-[10px] text-muted-foreground">{t("contest.prize")}</div>
                      <div className="text-xs text-foreground">{c.prizeLabel}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => joinContest(c.id)}
                    disabled={joined || c.status === "completed"}
                    className={cn("w-full", joined ? "bg-secondary text-muted-foreground" : "gradient-primary text-primary-foreground font-semibold")}
                  >
                    {joined ? t("contest.joined") : c.status === "completed" ? t("common.completed") : t("contest.joinContest")}
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center text-[10px] text-muted-foreground font-mono">
            {t("simulation.disclaimer")}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationContest;
