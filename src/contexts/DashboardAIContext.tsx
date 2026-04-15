'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import type { AIAnalysis } from '@/ai/engine';
import type { SmartAlert } from '@/types';

/** Max alerts shown in the TopBar notification dropdown (full count still on badge). */
export const TOPBAR_ALERTS_MAX = 5;

type DashboardAIContextValue = {
  aiData: AIAnalysis | null;
  loading: boolean;
  /** Critical + warning alerts (for TopBar badge). */
  urgentAlertCount: number;
  /** Same filter as the badge, capped for the header dropdown list. */
  urgentAlerts: SmartAlert[];
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

  const urgentAlerts = useMemo(() => {
    const alerts = aiData?.alerts ?? [];
    return alerts
      .filter((a) => a.severity === 'critical' || a.severity === 'warning')
      .slice(0, TOPBAR_ALERTS_MAX);
  }, [aiData]);

  const urgentAlertCount = useMemo(() => {
    const alerts = aiData?.alerts ?? [];
    return alerts.filter((a) => a.severity === 'critical' || a.severity === 'warning').length;
  }, [aiData]);

  const value = useMemo(
    () => ({ aiData, loading, urgentAlertCount, urgentAlerts, refresh: load }),
    [aiData, loading, urgentAlertCount, urgentAlerts, load]
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
