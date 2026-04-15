"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, Package, ChevronLeft, ChevronRight } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { CATEGORY_CONFIG, Category } from "@/types/product";
import { formatCurrency } from "@/lib/utils/pricing";
import AddProductForm from "@/components/products/AddProductForm";
import clsx from "clsx";

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const { products, isLoading, fetchProducts } = useProductStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const categoryCount = Object.keys(CATEGORY_CONFIG).length;

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = useMemo(
    () =>
      products.filter((p) => {
        const matchSearch =
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.productCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
        return matchSearch && matchCategory;
      }),
    [products, searchQuery, selectedCategory]
  );

  useEffect(() => {
    setPage(0);
  }, [searchQuery, selectedCategory]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
    const mp = tp - 1;
    setPage((p) => Math.min(p, mp));
  }, [filteredProducts.length]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const maxPage = totalPages - 1;
  const safePage = Math.min(page, maxPage);
  const pageProducts = filteredProducts.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const rangeStart = filteredProducts.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const rangeEnd = Math.min((safePage + 1) * PAGE_SIZE, filteredProducts.length);

  const stats = [
    {
      label: "Total Products",
      value: products.length,
      color: "text-sky-400",
      bg: "bg-sky-500/10",
      ring: "ring-sky-500/20",
    },
    {
      label: "Low Stock",
      value: products.filter((p) => p.quantity <= p.lowStockAlert).length,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      ring: "ring-rose-500/20",
    },
    {
      label: "Categories",
      value: categoryCount,
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      ring: "ring-violet-500/20",
    },
    {
      label: "Active Products",
      value: products.filter((p) => p.isActive).length,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      ring: "ring-emerald-500/20",
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero — matches inventory / dashboard rhythm */}
      <div className="relative overflow-hidden rounded-xl sm:rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0a1628] via-[#0d1f3c] to-[#0a1628] p-4 sm:p-6 lg:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_60%)]" />
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="mb-2 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20 sm:h-9 sm:w-9">
                <Package className="h-4 w-4 text-emerald-400 sm:h-5 sm:w-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400/90">Catalog</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">Products</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Manage your product inventory across all categories
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-slate-950 shadow-[0_8px_32px_rgba(34,197,94,0.25)] transition hover:bg-emerald-400 active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={clsx(
                "rounded-xl border border-white/[0.06] p-4 ring-1 backdrop-blur-sm transition hover:border-white/[0.1]",
                stat.bg,
                stat.ring
              )}
            >
              <p className={clsx("text-2xl font-bold tabular-nums", stat.color)}>{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5 sm:p-4 backdrop-blur-sm">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or product code..."
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory("ALL")}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === "ALL"
                  ? "bg-emerald-500 text-slate-950"
                  : "border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
              )}
            >
              All
            </button>
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-emerald-500 text-slate-950"
                    : "border border-white/[0.08] bg-white/[0.04] text-slate-300 hover:bg-white/[0.07]"
                )}
              >
                {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/[0.05] bg-white/[0.015] backdrop-blur-sm">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-slate-500">
              <Package className="mb-3 h-12 w-12 opacity-40" />
              <p className="font-medium text-slate-400">No products found</p>
              <p className="text-sm text-slate-500">Try adjusting your filters or add a new product</p>
            </div>
          ) : (
            <div className="overflow-x-auto [-webkit-overflow-scrolling:touch]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    {[
                      "Code",
                      "Name",
                      "Category",
                      "Unit",
                      "Qty",
                      "Buying Price",
                      "Margin",
                      "Selling Price",
                      "Profit/Unit",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="whitespace-nowrap px-3 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-4"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {pageProducts.map((product) => {
                    const isLowStock = product.quantity <= product.lowStockAlert;
                    const profit = product.sellingPrice - product.buyingPrice;

                    return (
                      <tr key={product.id} className="transition-colors hover:bg-white/[0.02]">
                        <td className="bg-white/[0.02] px-3 py-3 font-mono text-xs font-semibold text-slate-300 sm:px-4">
                          {product.productCode}
                        </td>
                        <td className="px-3 py-3 font-medium text-white sm:px-4">{product.name}</td>
                        <td className="px-3 py-3 sm:px-4">
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-1 text-xs text-slate-300">
                            {CATEGORY_CONFIG[product.category as Category]?.icon}
                            {CATEGORY_CONFIG[product.category as Category]?.label}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-400 sm:px-4">{product.unit}</td>
                        <td className="px-3 py-3 sm:px-4">
                          <span className="font-semibold tabular-nums text-slate-200">
                            {product.quantity}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-slate-300 tabular-nums sm:px-4">
                          {formatCurrency(product.buyingPrice)}
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <span className="font-semibold text-sky-400 tabular-nums">{product.marginPercent}%</span>
                        </td>
                        <td className="px-3 py-3 font-semibold text-emerald-400 tabular-nums sm:px-4">
                          {formatCurrency(product.sellingPrice)}
                        </td>
                        <td className="px-3 py-3 font-semibold text-violet-400 tabular-nums sm:px-4">
                          +{formatCurrency(profit)}
                        </td>
                        <td className="px-3 py-3 sm:px-4">
                          <span
                            className={clsx(
                              "rounded-full px-2 py-1 text-xs font-medium",
                              isLowStock
                                ? "bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/25"
                                : "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                            )}
                          >
                            {isLowStock ? "Low Stock" : "In Stock"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && filteredProducts.length > 0 && (
            <div
              role="navigation"
              aria-label="Product table pagination"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" && safePage > 0) {
                  e.preventDefault();
                  setPage((p) => Math.max(0, p - 1));
                } else if (e.key === "ArrowRight" && safePage < maxPage) {
                  e.preventDefault();
                  setPage((p) => Math.min(maxPage, p + 1));
                }
              }}
              className="flex flex-col items-stretch justify-between gap-3 border-t border-white/[0.06] px-3 py-3 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30 sm:flex-row sm:items-center sm:px-4"
            >
              <p className="text-center text-xs text-slate-500 sm:text-left">
                Showing{" "}
                <span className="font-medium text-slate-300">
                  {rangeStart}–{rangeEnd}
                </span>{" "}
                of <span className="font-medium text-slate-300">{filteredProducts.length}</span>
              </p>
              <div className="flex items-center justify-center gap-1 sm:justify-end">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={safePage <= 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  className={clsx(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
                    safePage <= 0
                      ? "cursor-not-allowed border-white/[0.04] text-slate-600"
                      : "border-white/[0.12] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] active:scale-[0.97]"
                  )}
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="min-w-[5.5rem] text-center text-xs tabular-nums text-slate-400">
                  Page {safePage + 1} / {totalPages}
                </span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={safePage >= maxPage}
                  onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
                  className={clsx(
                    "inline-flex h-9 w-9 items-center justify-center rounded-lg border transition",
                    safePage >= maxPage
                      ? "cursor-not-allowed border-white/[0.04] text-slate-600"
                      : "border-white/[0.12] bg-white/[0.04] text-slate-200 hover:bg-white/[0.08] active:scale-[0.97]"
                  )}
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAddForm && (
        <AddProductForm onClose={() => setShowAddForm(false)} onSuccess={fetchProducts} />
      )}
    </div>
  );
}
