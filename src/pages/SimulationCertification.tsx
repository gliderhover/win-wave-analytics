import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useI18n } from "@/i18n/I18nContext";
import { mockCertifiedAnalysts, CERTIFICATION_MIN_BETS, CERTIFICATION_MAX_DRAWDOWN, CertifiedAnalyst } from "@/lib/simulationData";
import { cn } from "@/lib/utils";
import { ArrowLeft, Award, Shield, Star, FileText, Download } from "lucide-react";

const medalColors: Record<string, string> = {
  gold: "text-signal-neutral",
  silver: "text-muted-foreground",
  bronze: "text-signal-bearish/70",
  certified: "text-primary",
};

const CertificatePreview = ({ analyst, onClose }: { analyst: CertifiedAnalyst; onClose: () => void }) => {
  const { t } = useI18n();
  return (
    <Dialog open onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="gradient-card border-primary/30 max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Award className="w-5 h-5 text-primary" />
            {t("certification.certificatePreview")}
          </DialogTitle>
        </DialogHeader>

        <div className="border-2 border-primary/30 rounded-xl p-8 text-center bg-background relative">
          <div className="absolute top-3 right-3 text-[9px] font-mono text-muted-foreground border border-border rounded p-1.5">
            QR
          </div>

          <Award className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-xs font-mono text-primary uppercase tracking-widest mb-2">Win-Wave Analytics</h2>
          <h3 className="text-2xl font-bold text-foreground mb-1">{t("certification.certifiedAnalystTitle")}</h3>
          <p className="text-sm text-muted-foreground mb-6">(Simulation)</p>

          <div className="text-lg font-bold text-foreground mb-1">{analyst.flag} {analyst.username}</div>
          <div className="text-sm text-muted-foreground mb-4">Season {analyst.year}</div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div>
              <div className="text-[10px] text-muted-foreground">{t("certification.rank")}</div>
              <div className="font-mono text-lg font-bold text-foreground">#{analyst.rank}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">{t("leaderboard.score")}</div>
              <div className="font-mono text-lg font-bold text-primary">{analyst.score}</div>
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground">{t("portfolio.roi")}</div>
              <div className="font-mono text-lg font-bold text-signal-bullish">+{analyst.roi}%</div>
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <div className="text-[10px] text-muted-foreground">________________________________</div>
            <div className="text-xs text-muted-foreground mt-1">Win-Wave Analytics • Paper Betting Simulation</div>
          </div>
        </div>

        <Button variant="outline" className="w-full mt-2" onClick={() => window.print()}>
          <Download className="w-4 h-4 mr-2" /> {t("certification.printDownload")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

const SimulationCertification = () => {
  const [previewAnalyst, setPreviewAnalyst] = useState<CertifiedAnalyst | null>(null);
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <Link to="/simulation" className="flex items-center gap-1 text-xs text-primary font-mono mb-4 hover:underline">
            <ArrowLeft className="w-3 h-3" /> {t("contest.backToSim")}
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Award className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("certification.title")}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-8">
            {t("certification.subtitle")}
          </p>

          <div className="gradient-card rounded-xl border border-primary/20 p-6 card-glow mb-8">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">{t("certification.certifiedAnalyst")}</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("certification.whatItMeans")}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t("certification.topRanking")}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("certification.topRankingDesc")}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t("certification.minBets", { count: String(CERTIFICATION_MIN_BETS) })}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("certification.minBetsDesc", { count: String(CERTIFICATION_MIN_BETS) })}</p>
              </div>
              <div className="bg-secondary/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{t("certification.maxDrawdownLabel", { value: String(CERTIFICATION_MAX_DRAWDOWN) })}</span>
                </div>
                <p className="text-xs text-muted-foreground">{t("certification.maxDrawdownDesc", { value: String(CERTIFICATION_MAX_DRAWDOWN) })}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">{t("certification.hallOfFame")}</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {mockCertifiedAnalysts.filter(a => a.rank <= 3).map(a => (
                <div key={a.rank} className={cn(
                  "gradient-card rounded-xl border p-5 text-center",
                  a.medal === "gold" ? "border-signal-neutral/40 shadow-[0_0_30px_hsl(38_92%_55%/0.1)]" :
                  a.medal === "silver" ? "border-muted-foreground/30" :
                  "border-signal-bearish/20"
                )}>
                  <div className="text-3xl mb-2">{["🥇", "🥈", "🥉"][a.rank - 1]}</div>
                  <div className="text-lg font-bold text-foreground">{a.flag} {a.username}</div>
                  <div className="font-mono text-sm text-muted-foreground mb-3">{t("leaderboard.score")}: {a.score}</div>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <div className="text-[10px] text-muted-foreground">{t("portfolio.roi")}</div>
                      <div className="font-mono text-sm font-bold text-signal-bullish">+{a.roi}%</div>
                    </div>
                    <div className="bg-secondary/50 rounded-lg p-2">
                      <div className="text-[10px] text-muted-foreground">{t("leaderboard.bets")}</div>
                      <div className="font-mono text-sm font-bold text-foreground">{a.bets}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs w-full" onClick={() => setPreviewAnalyst(a)}>
                    {t("certification.viewCertificate")}
                  </Button>
                </div>
              ))}
            </div>

            <div className="gradient-card rounded-xl border border-border overflow-hidden">
              <div className="grid grid-cols-[50px_1fr_70px_70px_60px_70px_50px] bg-secondary/50 px-4 py-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <span>#</span>
                <span>Analyst</span>
                <span className="text-right">{t("leaderboard.score")}</span>
                <span className="text-right">{t("portfolio.roi")}</span>
                <span className="text-right">{t("leaderboard.bets")}</span>
                <span className="text-right">MaxDD</span>
                <span></span>
              </div>
              {mockCertifiedAnalysts.map((a, i) => (
                <div key={a.rank} className={cn("grid grid-cols-[50px_1fr_70px_70px_60px_70px_50px] px-4 py-2 text-xs items-center", i % 2 === 0 ? "" : "bg-secondary/10")}>
                  <span className={cn("font-mono font-bold", medalColors[a.medal])}>{a.rank}</span>
                  <span className="text-foreground font-semibold">{a.flag} {a.username}</span>
                  <span className="text-right font-mono text-primary">{a.score}</span>
                  <span className="text-right font-mono text-signal-bullish">+{a.roi}%</span>
                  <span className="text-right font-mono text-muted-foreground">{a.bets}</span>
                  <span className="text-right font-mono text-signal-bearish">{a.maxDrawdown}%</span>
                  <button onClick={() => setPreviewAnalyst(a)} className="text-primary hover:underline text-[10px] text-right">Cert</button>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center text-[10px] text-muted-foreground font-mono">
            {t("simulation.disclaimer")} • {t("simulation.footerDisclaimer")}
          </div>
        </div>
      </div>

      {previewAnalyst && (
        <CertificatePreview analyst={previewAnalyst} onClose={() => setPreviewAnalyst(null)} />
      )}
    </div>
  );
};

export default SimulationCertification;
