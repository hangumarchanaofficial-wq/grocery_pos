import { runFullAnalysis, type AIAnalysis, type AnalysisScope } from '@/ai/engine';

const caches: Record<AnalysisScope, { data: AIAnalysis; timestamp: number } | null> = {
  dashboard: null,
  full: null,
};

const CACHE_TTL_MS = 5 * 60 * 1000;

/** Single-flight cache for heavy AI work — dashboard vs full are cached separately. */
export async function getCachedFullAnalysis(scope: AnalysisScope = 'dashboard'): Promise<AIAnalysis> {
  const now = Date.now();
  const slot = caches[scope];
  if (slot && now - slot.timestamp < CACHE_TTL_MS) {
    return slot.data;
  }
  const data = await runFullAnalysis({ scope });
  caches[scope] = { data, timestamp: now };
  return data;
}
