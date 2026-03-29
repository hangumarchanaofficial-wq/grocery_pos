// ============================================================
// Sales Chart — Dark premium with gradient fills
// ============================================================

'use client';

import Card from '@/components/ui/Card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
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
  const formatValue = (v: number | string | readonly (number | string)[] | undefined) => {
    const num = typeof v === 'number' ? v : Number(Array.isArray(v) ? v[0] : v ?? 0);
    return `Rs ${num.toLocaleString('en-IN')}`;
  };

  return (
    <Card variant="strong">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="heading-lg text-xl font-semibold">Sales Overview</h3>
          <p className="body-muted mt-1 text-sm">
            Revenue and profit velocity across the last seven trading days.
          </p>
        </div>
        <div className="inner-panel px-4 py-2 text-right">
          <p className="label-caps">Window</p>
          <p className="mt-1 text-sm font-medium text-slate-200">Last 7 Days</p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.4} />
              </linearGradient>
              <linearGradient id="profitFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(148,163,184,0.06)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(v) => `Rs ${(v / 1000).toFixed(0)}k`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
              contentStyle={{
                borderRadius: '16px',
                border: '1px solid rgba(148,163,184,0.1)',
                background: 'rgba(10,18,35,0.96)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
                color: '#e2e8f0',
                fontSize: '12px',
              }}
              formatter={(value, name) => [
                formatValue(value),
                name === 'sales' ? 'Sales' : 'Profit',
              ]}
            />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: '12px' }}
            />
            <Bar
              dataKey="sales"
              fill="url(#salesFill)"
              radius={[8, 8, 0, 0]}
              name="Sales"
            />
            <Bar
              dataKey="profit"
              fill="url(#profitFill)"
              radius={[8, 8, 0, 0]}
              name="Profit"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
