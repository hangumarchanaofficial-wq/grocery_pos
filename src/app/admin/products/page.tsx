"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Package, AlertTriangle } from "lucide-react";
import { useProductStore } from "@/store/productStore";
import { CATEGORY_CONFIG, Category } from "@/types/product";
import { formatCurrency } from "@/lib/utils/pricing";
import AddProductForm from "@/components/products/AddProductForm";
import clsx from "clsx";

export default function ProductsPage() {
  const { products, isLoading, fetchProducts } = useProductStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | "ALL">("ALL");

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.productCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your product inventory across all categories
            </p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>

        <div className="mb-6 grid grid-cols-4 gap-4">
          {[
            {
              label: "Total Products",
              value: products.length,
              color: "bg-blue-50 text-blue-700",
            },
            {
              label: "Low Stock",
              value: products.filter((p) => p.quantity <= p.lowStockAlert).length,
              color: "bg-red-50 text-red-700",
            },
            {
              label: "Categories",
              value: 7,
              color: "bg-purple-50 text-purple-700",
            },
            {
              label: "Active Products",
              value: products.filter((p) => p.isActive).length,
              color: "bg-green-50 text-green-700",
            },
          ].map((stat) => (
            <div key={stat.label} className={clsx("rounded-xl p-4", stat.color)}>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-sm opacity-75">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or product code..."
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory("ALL")}
              className={clsx(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                selectedCategory === "ALL"
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              All
            </button>
            {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={clsx(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                  selectedCategory === cat
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {CATEGORY_CONFIG[cat].icon} {CATEGORY_CONFIG[cat].label}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center text-gray-400">
              <Package className="mb-3 h-12 w-12 opacity-40" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Try adjusting your filters or add a new product</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
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
                        className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map((product) => {
                    const isLowStock = product.quantity <= product.lowStockAlert;
                    const profit = product.sellingPrice - product.buyingPrice;

                    return (
                      <tr key={product.id} className="transition-colors hover:bg-gray-50">
                        <td className="bg-gray-50 px-4 py-3 font-mono text-xs font-semibold text-gray-700">
                          {product.productCode}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                            {CATEGORY_CONFIG[product.category as Category]?.icon}
                            {CATEGORY_CONFIG[product.category as Category]?.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{product.unit}</td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              "font-semibold",
                              isLowStock ? "text-red-600" : "text-gray-800"
                            )}
                          >
                            {product.quantity}
                            {isLowStock && (
                              <AlertTriangle className="ml-1 inline h-3.5 w-3.5 text-red-500" />
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {formatCurrency(product.buyingPrice)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-blue-600">
                            {product.marginPercent}%
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-700">
                          {formatCurrency(product.sellingPrice)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-indigo-600">
                          +{formatCurrency(profit)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={clsx(
                              "rounded-full px-2 py-1 text-xs font-medium",
                              isLowStock
                                ? "bg-red-100 text-red-600"
                                : "bg-green-100 text-green-600"
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
        </div>
      </div>

      {showAddForm && (
        <AddProductForm onClose={() => setShowAddForm(false)} onSuccess={fetchProducts} />
      )}
    </div>
  );
}
