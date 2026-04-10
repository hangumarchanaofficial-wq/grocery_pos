"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  Brain, TrendingUp, TrendingDown, ShoppingBasket, Users,
  AlertTriangle, BarChart3, Sparkles, RefreshCw, Tag,
  ChevronRight, ArrowUp, ArrowDown, Minus,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function IntelligencePage() {
  const { apiFetch, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("summary");

  async function load() {
    setLoading(true);
    try {
      const res = await apiFetch("/api/ai/full");
      const json = await res.json();
      setData(json.data ?? json);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  if (!["OWNER", "MANAGER"].includes(user?.role ?? ""))
    return <p className="text-slate-400 p-8">Access restricted to Owner / Manager.</p>;

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-violet-500/20 border-t-violet-400" />
        <p className="text-xs text-slate-500">Running AI analysis…</p>
      </div>
    </div>
  );

  const tabs = [
    { id: "summary",    label: "Daily Summary",    icon: Sparkles },
    { id: "alerts",     label: "Alerts",           icon: AlertTriangle },
    { id: "predictions",label: "Stock Predictions",icon: Brain },
    { id: "insights",   label: "Sales Insights",   icon: TrendingUp },
    { id: "basket",     label: "Basket Analysis",  icon: ShoppingBasket },
    { id: "customers",  label: "Customers",        icon: Users },
    { id: "anomalies",  label: "Anomalies",        icon: AlertTriangle },
    { id: "categories", label: "Categories",       icon: BarChart3 },
    { id: "pricing",    label: "Pricing",          icon: Tag },
  ];

  const severityColor = (s: string) =>
    s === "critical" ? "text-red-400 bg-red-500/10 border-red-400/20"
    : s === "warning" ? "text-amber-400 bg-amber-500/10 border-amber-400/20"
    : "text-sky-400 bg-sky-500/10 border-sky-400/20";

  const gradeColor = (g: string) =>
    g === "A" ? "text-emerald-400" : g === "B" ? "text-sky-400"
    : g === "C" ? "text-amber-400" : "text-red-400";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[16px] border border-violet-400/20 bg-violet-500/15">
            <Brain size={20} className="text-violet-300" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100">Smart Intelligence</h1>
            <p className="text-xs text-slate-500">
              Powered by your store data · Generated {data?.generatedAt ? new Date(data.generatedAt).toLocaleTimeString() : "just now"}
            </p>
          </div>
        </div>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 rounded-[12px] border px-3 py-1.5 text-xs font-medium transition-all ${
              tab === t.id
                ? "border-violet-400/20 bg-violet-500/15 text-violet-300"
                : "border-white/8 bg-white/[0.02] text-slate-500 hover:text-slate-300"
            }`}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      {/* ── DAILY SUMMARY ── */}
      {tab === "summary" && data?.dailySummary && (
        <div className="space-y-4">
          <div className="rounded-[20px] border border-violet-400/15 bg-violet-500/[0.06] p-6">
            <p className="text-sm leading-relaxed text-slate-200">{data.dailySummary.en}</p>
          </div>
          <div className="rounded-[20px] border border-emerald-400/15 bg-emerald-500/[0.05] p-6">
            <p className="text-sm leading-relaxed text-slate-300" style={{ fontFamily: "'Noto Sans Sinhala', sans-serif" }}>
              {data.dailySummary.si}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(data.dailySummary.highlights ?? []).map((h: any, i: number) => (
              <div key={i} className="rounded-[16px] border border-white/8 bg-white/[0.03] p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{h.label}</p>
                <p className="mt-1 text-lg font-semibold text-slate-100">{h.value}</p>
                <span className="mt-1 flex items-center gap-1 text-xs">
                  {h.trend === "up"      ? <ArrowUp size={10} className="text-emerald-400" />
                   : h.trend === "down"  ? <ArrowDown size={10} className="text-red-400" />
                   : <Minus size={10} className="text-slate-500" />}
                  <span className={h.trend === "up" ? "text-emerald-400" : h.trend === "down" ? "text-red-400" : "text-slate-500"}>
                    {h.trend}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── ALERTS ── */}
      {tab === "alerts" && (
        <div className="space-y-3">
          {(data?.alerts ?? []).length === 0
            ? <p className="text-slate-500 text-sm">No active alerts. All good!</p>
            : (data.alerts ?? []).map((a: any) => (
              <div key={a.id} className={`rounded-[16px] border p-4 ${severityColor(a.severity)}`}>
                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs mt-1 opacity-80">{a.message}</p>
                  </div>
                  <span className={`ml-auto shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${severityColor(a.severity)}`}>
                    {a.severity}
                  </span>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {/* ── STOCK PREDICTIONS ── */}
      {tab === "predictions" && (
        <div className="overflow-hidden rounded-[20px] border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02] text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Avg Daily Sales</th>
                <th className="px-4 py-3">Days Left</th>
                <th className="px-4 py-3">Stockout Date</th>
                <th className="px-4 py-3">Urgency</th>
              </tr>
            </thead>
            <tbody>
              {(data?.predictions ?? []).filter((p: any) => p.daysUntilStockout < 999).map((p: any) => (
                <tr key={p.productId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-slate-200">{p.productName}</td>
                  <td className="px-4 py-3 text-slate-400">{p.currentStock}</td>
                  <td className="px-4 py-3 text-slate-400">{p.avgDailySales}</td>
                  <td className="px-4 py-3">
                    <span className={p.daysUntilStockout <= 2 ? "text-red-400 font-bold" : p.daysUntilStockout <= 7 ? "text-amber-400" : "text-slate-400"}>
                      {p.daysUntilStockout}d
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{p.predictedStockoutDate}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${severityColor(p.urgency === "critical" ? "critical" : p.urgency === "warning" ? "warning" : "info")}`}>
                      {p.urgency}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SALES INSIGHTS ── */}
      {tab === "insights" && (
        <div className="space-y-3">
          {(data?.insights ?? []).map((ins: any, i: number) => (
            <div key={i} className="flex items-start gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] p-4">
              <div className={`mt-0.5 shrink-0 ${ins.type === "top_selling" ? "text-emerald-400" : ins.type === "trending_up" ? "text-sky-400" : ins.type === "trending_down" ? "text-red-400" : "text-amber-400"}`}>
                {ins.type === "trending_up" ? <TrendingUp size={16} /> : ins.type === "trending_down" ? <TrendingDown size={16} /> : <BarChart3 size={16} />}
              </div>
              <div>
                <p className="font-semibold text-sm text-slate-200">{ins.productName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{ins.message}</p>
              </div>
              <span className="ml-auto text-sm font-bold text-slate-300">{ins.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── BASKET ANALYSIS ── */}
      {tab === "basket" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Products frequently purchased together — use for store layout and promotions.</p>
          {(data?.basket ?? []).map((pair: any, i: number) => (
            <div key={i} className="flex items-center gap-3 rounded-[16px] border border-white/8 bg-white/[0.02] p-4">
              <span className="font-medium text-sm text-slate-200">{pair.nameA}</span>
              <ChevronRight size={14} className="text-slate-600" />
              <span className="font-medium text-sm text-slate-200">{pair.nameB}</span>
              <div className="ml-auto text-right">
                <p className="text-xs text-slate-500">Co-occurrences</p>
                <p className="text-sm font-bold text-emerald-400">{pair.coOccurrences}×</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">Confidence</p>
                <p className="text-sm font-bold text-sky-400">{pair.confidence}%</p>
              </div>
            </div>
          ))}
          {(data?.basket ?? []).length === 0 && <p className="text-slate-500 text-sm">Not enough bill data yet for basket analysis.</p>}
        </div>
      )}

      {/* ── CUSTOMER INSIGHTS ── */}
      {tab === "customers" && (
        <div className="overflow-hidden rounded-[20px] border border-white/8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.02] text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Tag</th>
                <th className="px-4 py-3">Total Spent</th>
                <th className="px-4 py-3">Visits</th>
                <th className="px-4 py-3">Avg Basket</th>
                <th className="px-4 py-3">Last Visit</th>
                <th className="px-4 py-3">Loyalty</th>
                <th className="px-4 py-3">Churn Risk</th>
              </tr>
            </thead>
            <tbody>
              {(data?.customerInsights ?? []).map((c: any) => (
                <tr key={c.customerId} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 font-medium text-slate-200">{c.name}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${c.tag === "VIP" ? "text-amber-400 bg-amber-500/10 border-amber-400/20" : "text-slate-400 bg-white/5 border-white/10"}`}>
                      {c.tag}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{formatCurrency(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-slate-400">{c.visitCount}</td>
                  <td className="px-4 py-3 text-slate-400">{formatCurrency(c.avgBasket)}</td>
                  <td className="px-4 py-3 text-slate-400">{c.lastVisitDaysAgo}d ago</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-emerald-400" style={{ width: `${c.loyaltyScore}%` }} />
                      </div>
                      <span className="text-xs text-slate-400">{c.loyaltyScore}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${c.churnRisk === "high" ? "text-red-400" : c.churnRisk === "medium" ? "text-amber-400" : "text-emerald-400"}`}>
                      {c.churnRisk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ANOMALIES ── */}
      {tab === "anomalies" && (
        <div className="space-y-3">
          {(data?.anomalies ?? []).length === 0
            ? <p className="text-slate-500 text-sm">No anomalies detected. Everything looks normal.</p>
            : (data.anomalies ?? []).map((a: any) => (
              <div key={a.id} className={`rounded-[16px] border p-4 ${severityColor(a.severity)}`}>
                <p className="font-semibold text-sm">{a.title}</p>
                <p className="text-xs mt-1 opacity-80">{a.message}</p>
                <p className="text-[10px] mt-2 opacity-50">Detected: {new Date(a.detectedAt).toLocaleString()}</p>
              </div>
            ))
          }
        </div>
      )}

      {/* ── CATEGORY SCORES ── */}
      {tab === "categories" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.categoryScores ?? []).map((cat: any) => (
            <div key={cat.category} className="rounded-[20px] border border-white/8 bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-sm text-slate-200">{cat.label}</span>
                <span className={`text-2xl font-black ${gradeColor(cat.grade)}`}>{cat.grade}</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between"><span>Revenue (30d)</span><span className="text-slate-200">{formatCurrency(cat.totalRevenue)}</span></div>
                <div className="flex justify-between"><span>Profit (30d)</span><span className="text-slate-200">{formatCurrency(cat.totalProfit)}</span></div>
                <div className="flex justify-between"><span>Avg Margin</span><span className="text-slate-200">{cat.avgMargin}%</span></div>
                <div className="flex justify-between"><span>Sales/day</span><span className="text-slate-200">{cat.salesVelocity} units</span></div>
              </div>
              <div className="mt-3 h-1.5 w-full rounded-full bg-white/10">
                <div className={`h-full rounded-full ${cat.grade === "A" ? "bg-emerald-400" : cat.grade === "B" ? "bg-sky-400" : cat.grade === "C" ? "bg-amber-400" : "bg-red-400"}`} style={{ width: `${cat.score}%` }} />
              </div>
              <p className="mt-3 text-[11px] text-slate-500 leading-relaxed">{cat.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── PRICING SUGGESTIONS ── */}
      {tab === "pricing" && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Suggestions based on margin vs sales velocity. Review before applying.</p>
          {(data?.pricingSuggestions ?? []).length === 0
            ? <p className="text-slate-500 text-sm">All product prices look optimal based on current sales data.</p>
            : (data.pricingSuggestions ?? []).map((s: any) => (
              <div key={s.productId} className="rounded-[16px] border border-white/8 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-sm text-slate-200">{s.productName}</p>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase ${s.priority === "high" ? "text-red-400 bg-red-500/10 border-red-400/20" : s.priority === "medium" ? "text-amber-400 bg-amber-500/10 border-amber-400/20" : "text-slate-400 bg-white/5 border-white/10"}`}>
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{s.reason}</p>
                    <p className="text-xs text-slate-500 mt-1">{s.expectedImpact}</p>
                  </div>
                  <div className="shrink-0 text-right space-y-1">
                    <div>
                      <p className="text-[10px] text-slate-500">Current</p>
                      <p className="text-sm text-slate-300">{formatCurrency(s.currentPrice)} ({s.currentMargin}%)</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-emerald-400">Suggested</p>
                      <p className="text-sm font-bold text-emerald-300">{formatCurrency(s.suggestedPrice)} ({s.suggestedMargin}%)</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}
