// ============================================================
// Reports Page — Premium dark-themed analytics
// ============================================================

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';
import Badge from '@/components/ui/Badge';
import InsightsPanel from '@/components/ai/InsightsPanel';
import { Download, TrendingUp, Receipt, DollarSign, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';

interface ReportRow {
  date: string;
  totalSales: number;
  totalBills: number;
  totalProfit: number;
  topProduct: string;
}

interface ReportSummary {
  totalSales: number;
  totalProfit: number;
  totalBills: number;
}

export default function ReportsPage() {
  const { apiFetch } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [from, setFrom] = useState(
    new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)
  );
  const [to, setTo] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState<ReportRow[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const formatChartValue = (
    value: number | string | readonly (number | string)[] | undefined
  ) => {
    const resolvedValue = Array.isArray(value) ? value[0] : value;
    const numericValue = typeof resolvedValue === 'number' ? resolvedValue : Number(resolvedValue ?? 0);
    return `Rs ${numericValue.toFixed(0)}`;
  };

  const loadReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/reports?period=${period}&from=${from}&to=${to}`);
      const data = await res.json();
      setReport(data.report || []);
      setSummary(data.summary || null);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [apiFetch, period, from, to]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleExport = async () => {
    try {
      const res = await apiFetch(`/api/reports/export?from=${from}&to=${to}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sales-report-${from}-to-${to}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported!');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card className="glass-panel-strong overflow-hidden p-0">
        <div className="px-6 py-6 lg:px-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="success" className="mb-4">
                <BarChart3 size={10} className="mr-1" /> Analytics
              </Badge>
              <h2 className="section-title text-3xl font-semibold">Reports & Analytics</h2>
              <p className="section-subtitle mt-2 max-w-xl text-sm leading-6">
                Revenue tracking, profit analytics, and AI-generated sales insights across custom date ranges.
              </p>
            </div>
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-2" /> Export CSV
            </Button>
          </div>
        </div>
      </Card>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            options={[
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
            ]}
          />
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      </Card>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card padding="sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/12">
                <DollarSign size={22} className="text-brand-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total Sales</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-50">
                  {formatCurrency(summary.totalSales)}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/12">
                <TrendingUp size={22} className="text-sky-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total Profit</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-50">
                  {formatCurrency(summary.totalProfit)}
                </p>
              </div>
            </div>
          </Card>
          <Card padding="sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/12">
                <Receipt size={22} className="text-violet-300" />
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Total Bills</p>
                <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-50">
                  {summary.totalBills}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Sales Chart */}
      <Card className="glass-panel-strong">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="section-title text-xl font-semibold">Sales Trend</h3>
            <p className="section-subtitle mt-1 text-sm">Revenue flow across selected period.</p>
          </div>
        </div>
        {loading ? (
          <div className="flex h-72 items-center justify-center text-slate-500">Loading chart data...</div>
        ) : (
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
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={formatChartValue} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '18px',
                    border: '1px solid rgba(148,163,184,0.14)',
                    background: 'rgba(15,23,42,0.94)',
                    boxShadow: '0 30px 80px rgba(2,6,23,0.32)',
                    color: '#e2e8f0',
                  }}
                  formatter={(value) => [formatChartValue(value)]}
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
        )}
      </Card>

      {/* Detailed Table */}
      <Card className="glass-panel-strong">
        <div className="mb-5">
          <h3 className="section-title text-xl font-semibold">Detailed Breakdown</h3>
          <p className="section-subtitle mt-1 text-sm">Revenue, profit, and top product per period.</p>
        </div>
        <div className="overflow-x-auto rounded-[22px] border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8">
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Period</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Sales</th>
                <th className="px-5 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Profit</th>
                <th className="px-5 py-4 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Bills</th>
                <th className="px-5 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Top Product</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {report.map((row) => (
                <tr key={row.date} className="transition-colors hover:bg-white/[0.02]">
                  <td className="px-5 py-3.5 font-medium text-slate-200">{row.date}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-slate-100">{formatCurrency(row.totalSales)}</td>
                  <td className="px-5 py-3.5 text-right text-brand-300">{formatCurrency(row.totalProfit)}</td>
                  <td className="px-5 py-3.5 text-center text-slate-300">{row.totalBills}</td>
                  <td className="px-5 py-3.5"><Badge variant="info">{row.topProduct}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* AI Insights */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/12">
            <TrendingUp size={16} className="text-violet-300" />
          </div>
          <h3 className="section-title text-xl font-semibold">AI Sales Insights</h3>
        </div>
        <InsightsPanel />
      </div>
    </div>
  );
}
