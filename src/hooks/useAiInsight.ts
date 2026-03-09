import { useCallback, useEffect, useState } from "react";

type AiInsightData = {
  aiInsight: string;
  keyFactors: string[];
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  confidence: number;
};

type UseAiInsightResult = {
  data: AiInsightData | null;
  loading: boolean;
  error: string | null;
  fetchNow: () => void;
};

const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function useAiInsight(fixtureId: string | null, eager: boolean): UseAiInsightResult {
  const [data, setData] = useState<AiInsightData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  const load = useCallback(async () => {
    if (!fixtureId || loading) return;
    setHasRequested(true);
    setError(null);

    const now = Date.now();
    const storageKey = `ai_insight_${fixtureId}`;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const cached = JSON.parse(raw);
        if (cached?.ts && now - cached.ts < SIX_HOURS_MS && cached?.data?.aiInsight) {
          setData(cached.data);
          return;
        }
      }
    } catch {
      // ignore cache errors
    }

    try {
      setLoading(true);
      const res = await fetch("/api/sports?type=ai_insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fixtureId }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "AI insight request failed");
      }
      const next: AiInsightData = {
        aiInsight: String(json.aiInsight ?? "").trim(),
        keyFactors: Array.isArray(json.keyFactors) ? json.keyFactors.map(String) : [],
        riskLevel: (["LOW", "MEDIUM", "HIGH"].includes(json.riskLevel) ? json.riskLevel : "MEDIUM") as
          | "LOW"
          | "MEDIUM"
          | "HIGH",
        confidence: Number(json.confidence ?? 50),
      };
      setData(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify({ ts: now, data: next }));
      } catch {
        // ignore quota errors
      }
    } catch (e: any) {
      setError(e?.message || "Insight unavailable");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [fixtureId, loading]);

  useEffect(() => {
    if (eager && fixtureId && !hasRequested) {
      load();
    }
  }, [eager, fixtureId, hasRequested, load]);

  return {
    data,
    loading,
    error,
    fetchNow: load,
  };
}

