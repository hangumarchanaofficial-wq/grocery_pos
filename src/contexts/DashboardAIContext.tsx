'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AIAnalysis } from '@/ai/engine';

type DashboardAIContextValue = {
  aiData: AIAnalysis | null;
  loading: boolean;
  /** Critical + warning alerts (for TopBar badge). */
  urgentAlertCount: number;
  refresh: () => void;
};

const DashboardAIContext = createContext<DashboardAIContextValue | null>(null);

export function DashboardAIProvider({ children }: { children: React.ReactNode }) {
  const { apiFetch } = useAuth();
  const [aiData, setAiData] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/ai/analysis');
      const json = (await res.json()) as AIAnalysis;
      if (res.ok) setAiData(json);
      else setAiData(null);
    } catch {
      setAiData(null);
    } finally {
      setLoading(false);
    }
  }, [apiFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const urgentAlertCount = useMemo(() => {
    const alerts = aiData?.alerts ?? [];
    return alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').length;
  }, [aiData]);

  const value = useMemo(
    () => ({ aiData, loading, urgentAlertCount, refresh: load }),
    [aiData, loading, urgentAlertCount, load]
  );

  return <DashboardAIContext.Provider value={value}>{children}</DashboardAIContext.Provider>;
}

export function useDashboardAI() {
  const ctx = useContext(DashboardAIContext);
  if (!ctx) {
    throw new Error('useDashboardAI must be used within DashboardAIProvider');
  }
  return ctx;
}
