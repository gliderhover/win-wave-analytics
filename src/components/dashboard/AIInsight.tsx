import { useQuery } from "@tanstack/react-query";
import { MatchData } from "@/lib/mockData";

type AIInsightProps = {
  match?: MatchData;
  fixtureId?: number | string | null;
};

const AIInsight = ({ match, fixtureId }: AIInsightProps) => {
  const effectiveId =
    fixtureId != null
      ? String(fixtureId)
      : match
        ? String(match.id)
        : null;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["ai-insight", effectiveId],
    queryFn: async () => {
      const res = await fetch("/api/sports?type=ai_insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "ai_insight", fixtureId: effectiveId }),
      });
      const json = await res.json();
      if (!json.ok) {
        throw new Error("Failed to load AI insight");
      }
      return json as {
        fixtureId?: string | number;
        aiInsight: string;
        keyFactors?: string[];
        riskLevel?: "LOW" | "MEDIUM" | "HIGH";
        confidence?: number;
      };
    },
    enabled: effectiveId != null,
    retry: 1,
  });

  // Never use mock match data when we're fetching for a real fixture — only use API response
  const fallbackText = effectiveId != null ? "Insight unavailable." : (match?.aiInsight ?? "Insight unavailable.");
  const aiInsight = data?.aiInsight?.trim() || fallbackText;
  const keyFactors = data?.keyFactors ?? [];
  const riskLevel = data?.riskLevel ?? "MEDIUM";
  const confidence =
    typeof data?.confidence === "number" && !Number.isNaN(data.confidence)
      ? Math.round(data.confidence)
      : null;

  const riskColor =
    riskLevel === "LOW"
      ? "bg-signal-bullish/15 text-signal-bullish border-signal-bullish/30"
      : riskLevel === "HIGH"
      ? "bg-signal-bearish/15 text-signal-bearish border-signal-bearish/30"
      : "bg-signal-neutral/15 text-signal-neutral border-signal-neutral/30";

  return (
    <div className="gradient-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm">🤖</span>
        <h3 className="text-sm font-semibold text-foreground font-mono uppercase tracking-wider">
          AI Insight
        </h3>
      </div>

      {isLoading && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          Generating insight…
        </p>
      )}

      {!isLoading && (
        <>
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">
            {aiInsight}
          </p>

          {(keyFactors.length > 0 || confidence != null) && (
            <div className="flex flex-col gap-2">
              {keyFactors.length > 0 && (
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {keyFactors.map((f, idx) => (
                    <li key={idx}>{f}</li>
                  ))}
                </ul>
              )}
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                <span
                  className={`px-2 py-0.5 rounded border ${riskColor}`}
                >
                  Risk: {riskLevel}
                </span>
                {confidence != null && (
                  <span className="px-2 py-0.5 rounded border border-border text-muted-foreground">
                    Confidence: {confidence}%
                  </span>
                )}
              </div>
            </div>
          )}

          {isError && (
            <p className="text-[11px] text-muted-foreground mt-2">
              Insight unavailable.
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default AIInsight;
