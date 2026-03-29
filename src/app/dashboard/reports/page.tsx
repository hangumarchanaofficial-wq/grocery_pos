// ============================================================
// Reports Page - Sales analytics with date filtering + export
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
import { Download, TrendingUp, Receipt, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
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
        const numericValue =
            typeof resolvedValue === 'number' ? resolvedValue : Number(resolvedValue ?? 0);
        return `Rs ${numericValue.toFixed(2)}`;
    };

    const loadReport = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiFetch(`/api/reports?period=${period}&from=${from}&to=${to}`);
            const data = await res.json();
            setReport(data.report || []);
            setSummary(data.summary || null);
        } catch {
            // Ignore transient reporting failures in the page shell.
        } finally {
            setLoading(false);
        }
    }, [apiFetch, period, from, to]);

    useEffect(() => {
        loadReport();
    }, [loadReport]);

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
        } catch {
            toast.error('Export failed');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Reports & Analytics</h2>
                <Button variant="outline" onClick={handleExport}>
                    <Download size={16} className="mr-2" /> Export CSV
                </Button>
            </div>

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

            {summary && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Card padding="sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-green-50 p-2">
                                <DollarSign size={20} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Sales</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.totalSales)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card padding="sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-blue-50 p-2">
                                <TrendingUp size={20} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Profit</p>
                                <p className="text-xl font-bold">{formatCurrency(summary.totalProfit)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card padding="sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-purple-50 p-2">
                                <Receipt size={20} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Bills</p>
                                <p className="text-xl font-bold">{summary.totalBills}</p>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <Card>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Sales Trend</h3>
                {loading ? (
                    <div className="flex h-64 items-center justify-center text-gray-400">Loading...</div>
                ) : (
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={report}>
                                <defs>
                                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} tickFormatter={formatChartValue} />
                                <Tooltip formatter={(value) => [formatChartValue(value)]} />
                                <Area
                                    type="monotone"
                                    dataKey="totalSales"
                                    stroke="#22c55e"
                                    fill="url(#salesGrad)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </Card>

            <Card>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">Detailed Breakdown</h3>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b bg-gray-50">
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Period</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600">Sales</th>
                                <th className="px-4 py-3 text-right font-medium text-gray-600">Profit</th>
                                <th className="px-4 py-3 text-center font-medium text-gray-600">Bills</th>
                                <th className="px-4 py-3 text-left font-medium text-gray-600">Top Product</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {report.map((row) => (
                                <tr key={row.date} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium">{row.date}</td>
                                    <td className="px-4 py-3 text-right">{formatCurrency(row.totalSales)}</td>
                                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(row.totalProfit)}</td>
                                    <td className="px-4 py-3 text-center">{row.totalBills}</td>
                                    <td className="px-4 py-3">
                                        <Badge variant="info">{row.topProduct}</Badge>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">AI Sales Insights</h3>
                <InsightsPanel />
            </div>
        </div>
    );
}
