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

const insightColors = {
    top_selling: 'text-green-600 bg-green-50',
    low_selling: 'text-orange-600 bg-orange-50',
    trending_up: 'text-blue-600 bg-blue-50',
    trending_down: 'text-red-600 bg-red-50',
};

export default function InsightsPanel() {
    const { apiFetch } = useAuth();
    const [insights, setInsights] = useState<SalesInsight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const res = await apiFetch('/api/ai/insights');
                const data = await res.json();
                setInsights(data.insights || []);
            } catch { /* ignore */ }
            finally { setLoading(false); }
        }
        load();
    }, [apiFetch]);

    if (loading) {
        return <Card><div className="text-center py-8 text-gray-400">Analyzing sales data...</div></Card>;
    }

    // Group by type
    const grouped = {
        top_selling: insights.filter((i) => i.type === 'top_selling'),
        trending_up: insights.filter((i) => i.type === 'trending_up'),
        trending_down: insights.filter((i) => i.type === 'trending_down'),
        low_selling: insights.filter((i) => i.type === 'low_selling'),
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
                        <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${colors}`}>
                                <Icon size={16} />
                            </div>
                            {titles[type]}
                        </h4>
                        <div className="space-y-2">
                            {items.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-gray-50"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{item.message}</p>
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
