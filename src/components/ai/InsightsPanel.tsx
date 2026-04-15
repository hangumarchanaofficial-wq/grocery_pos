// ============================================================
// AI Insights Panel — Full view of AI-generated insights
// ============================================================

'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import { TrendingUp, TrendingDown, Zap, AlertTriangle } from 'lucide-react';
import type { SalesInsight } from '@/types';

const insightIcons = {
  top_selling: TrendingUp,
  low_selling: TrendingDown,
  trending_up: Zap,
  trending_down: AlertTriangle,
};

const insightColors: Record<
  keyof typeof insightIcons,
  { icon: string; row: string }
> = {
  top_selling: { icon: 'text-emerald-400', row: 'bg-emerald-500/10 ring-1 ring-emerald-400/20' },
  low_selling: { icon: 'text-amber-400', row: 'bg-amber-500/10 ring-1 ring-amber-400/20' },
  trending_up: { icon: 'text-sky-400', row: 'bg-sky-500/10 ring-1 ring-sky-400/20' },
  trending_down: { icon: 'text-rose-400', row: 'bg-rose-500/10 ring-1 ring-rose-400/20' },
};

type Props = {
  /** When set, skips internal fetch (e.g. shared with /api/ai/analysis). */
  insights?: SalesInsight[];
  loading?: boolean;
};

export default function InsightsPanel({ insights: insightsProp, loading: loadingProp }: Props) {
  const { apiFetch } = useAuth();
  const controlled = insightsProp !== undefined;
  const [insights, setInsights] = useState<SalesInsight[]>([]);
  const [loading, setLoading] = useState(!controlled);

  useEffect(() => {
    if (controlled) return;
    async function load() {
      try {
        const res = await apiFetch('/api/ai/insights');
        const data = await res.json();
        setInsights(Array.isArray(data) ? data : data?.insights ?? []);
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [apiFetch, controlled]);

  const list = controlled ? insightsProp! : insights;
  const busy = controlled ? (loadingProp ?? false) : loading;

  if (busy) {
    return (
      <Card>
        <div className="py-8 text-center text-slate-500">Analyzing sales data...</div>
      </Card>
    );
  }

  const grouped = {
    top_selling: list.filter((i) => i.type === 'top_selling'),
    trending_up: list.filter((i) => i.type === 'trending_up'),
    trending_down: list.filter((i) => i.type === 'trending_down'),
    low_selling: list.filter((i) => i.type === 'low_selling'),
  };

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, items]) => {
        if (items.length === 0) return null;
        const Icon = insightIcons[type as keyof typeof insightIcons];
        const colors = insightColors[type as keyof typeof insightColors];

        const titles: Record<string, string> = {
          top_selling: 'Best Selling Products',
          trending_up: 'Trending Up',
          trending_down: 'Trending Down',
          low_selling: 'Slow Moving Products',
        };

        return (
          <Card key={type}>
            <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-100">
              <div className={`rounded-lg p-1.5 ${colors.row}`}>
                <Icon size={16} className={colors.icon} />
              </div>
              {titles[type]}
            </h4>
            <div className="space-y-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">{item.productName}</p>
                    <p className="mt-0.5 text-xs text-slate-400">{item.message}</p>
                  </div>
                  <Badge variant={type.includes('top') || type.includes('up') ? 'success' : 'warning'}>
                    {item.value}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
