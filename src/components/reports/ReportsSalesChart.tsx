'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
interface Row {
  date: string;
  totalSales: number;
}

interface Props {
  report: Row[];
  loading: boolean;
  formatChartValue: (
    value: number | string | readonly (number | string)[] | undefined
  ) => string;
}

export default function ReportsSalesChart({ report, loading, formatChartValue }: Props) {
  if (loading) {
    return (
      <div className="flex h-72 items-center justify-center text-slate-500">Loading chart data...</div>
    );
  }
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={report}>
          <defs>
            <linearGradient id="reportSalesGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#22c55e" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            tickFormatter={(v) => formatChartValue(v)}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              borderRadius: '18px',
              border: '1px solid rgba(148,163,184,0.14)',
              background: 'rgba(15,23,42,0.94)',
              boxShadow: '0 30px 80px rgba(2,6,23,0.32)',
              color: '#e2e8f0',
            }}
            formatter={(value) => [formatChartValue(value), 'Sales']}
          />
          <Area
            type="monotone"
            dataKey="totalSales"
            stroke="#22c55e"
            fill="url(#reportSalesGrad)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
