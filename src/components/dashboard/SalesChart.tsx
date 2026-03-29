// ============================================================
// Sales Chart - 7-day sales and profit visualization
// ============================================================

'use client';

import Card from '@/components/ui/Card';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from 'recharts';

interface SalesChartProps {
    data: {
        date: string;
        label: string;
        sales: number;
        profit: number;
        bills: number;
    }[];
}

export default function SalesChart({ data }: SalesChartProps) {
    const formatChartValue = (
        value: number | string | readonly (number | string)[] | undefined
    ) => {
        const resolvedValue = Array.isArray(value) ? value[0] : value;
        const numericValue =
            typeof resolvedValue === 'number' ? resolvedValue : Number(resolvedValue ?? 0);
        return `Rs ${numericValue.toFixed(2)}`;
    };

    return (
        <Card className="glass-panel-strong">
            <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                    <h3 className="section-title text-xl font-semibold">Sales Overview</h3>
                    <p className="section-subtitle mt-1 text-sm">Revenue and profit velocity across the last seven trading days.</p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Window</p>
                    <p className="mt-1 text-sm font-medium text-slate-200">Last 7 Days</p>
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={formatChartValue} axisLine={false} tickLine={false} />
                        <Tooltip
                            cursor={{ fill: 'rgba(148,163,184,0.05)' }}
                            contentStyle={{
                                borderRadius: '18px',
                                border: '1px solid rgba(148,163,184,0.14)',
                                background: 'rgba(15,23,42,0.94)',
                                boxShadow: '0 30px 80px rgba(2,6,23,0.32)',
                                color: '#e2e8f0',
                            }}
                            formatter={(value, name) => [
                                formatChartValue(value),
                                name === 'sales' ? 'Sales' : 'Profit',
                            ]}
                        />
                        <Legend wrapperStyle={{ color: '#cbd5e1' }} />
                        <Bar dataKey="sales" fill="#22c55e" radius={[10, 10, 0, 0]} name="Sales" />
                        <Bar dataKey="profit" fill="#38bdf8" radius={[10, 10, 0, 0]} name="Profit" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
}
