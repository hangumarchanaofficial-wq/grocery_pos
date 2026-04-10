"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, RefreshCw, Tag, Calculator, Package } from "lucide-react";
import clsx from "clsx";
import { createProductSchema, CreateProductSchema } from "@/lib/validations/product";
import { calculateProfit, calculateSellingPrice, formatCurrency } from "@/lib/utils/pricing";
import { useProductStore } from "@/store/productStore";
import { CATEGORY_CONFIG, UNIT_LABELS, Category, Unit } from "@/types/product";

interface AddProductFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddProductForm({ onClose, onSuccess }: AddProductFormProps) {
  const { addProduct, isSubmitting, generateProductCode } = useProductStore();
  const [previewSelling, setPreviewSelling] = useState(0);
  const [previewProfit, setPreviewProfit] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductSchema>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      category: "VEGETABLES",
      unit: "KG",
      lowStockAlert: 5,
    },
  });

  const watchedCategory = watch("category") as Category;
  const watchedBuyingPrice = watch("buyingPrice");
  const watchedMargin = watch("marginPercent");
  const watchedUnit = watch("unit");

  useEffect(() => {
    if (watchedCategory) {
      const config = CATEGORY_CONFIG[watchedCategory];
      setValue("unit", config.defaultUnit);
      setValue("productCode", generateProductCode(watchedCategory));
    }
  }, [generateProductCode, setValue, watchedCategory]);

  useEffect(() => {
    const buying = parseFloat(String(watchedBuyingPrice)) || 0;
    const margin = parseFloat(String(watchedMargin)) || 0;

    if (buying > 0) {
      const selling = calculateSellingPrice(buying, margin);
      setPreviewSelling(selling);
      setPreviewProfit(calculateProfit(buying, selling));
      return;
    }

    setPreviewSelling(0);
    setPreviewProfit(0);
  }, [watchedBuyingPrice, watchedMargin]);

  const onSubmit = async (data: CreateProductSchema) => {
    const success = await addProduct(data);
    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  const categoryConfig = CATEGORY_CONFIG[watchedCategory];
  const isKgOnly = watchedCategory === "VEGETABLES" || watchedCategory === "FRUITS";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-gray-100 bg-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Add New Product</h2>
              <p className="text-sm text-gray-500">Fill in the product details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_CONFIG) as Category[]).map((cat) => {
                const config = CATEGORY_CONFIG[cat];
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setValue("category", cat)}
                    className={clsx(
                      "flex flex-col items-center gap-1 rounded-xl border-2 p-3 text-xs font-medium transition-all",
                      watchedCategory === cat
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    )}
                  >
                    <span className="text-xl">{config.icon}</span>
                    <span>{config.label}</span>
                  </button>
                );
              })}
            </div>
            {errors.category && (
              <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Product Code <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  {...register("productCode")}
                  placeholder="e.g. VEG-001"
                  className={clsx(
                    "w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm font-mono uppercase transition-colors focus:outline-none focus:ring-2 focus:ring-green-500",
                    errors.productCode ? "border-red-400 bg-red-50" : "border-gray-300"
                  )}
                  onChange={(e) => setValue("productCode", e.target.value.toUpperCase())}
                />
              </div>
              {errors.productCode && (
                <p className="mt-1 text-xs text-red-500">{errors.productCode.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-400">Auto-generated. You can edit it.</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="e.g. Tomato, Rice, T-Shirt"
                className={clsx(
                  "w-full rounded-lg border px-3 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green-500",
                  errors.name ? "border-red-400 bg-red-50" : "border-gray-300"
                )}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Description <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              {...register("description")}
              placeholder="Brief product description..."
              rows={2}
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                Unit <span className="text-red-500">*</span>
              </label>
              {isKgOnly ? (
                <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                  <span className="text-sm font-medium text-green-700">KG (Kilogram)</span>
                  <span className="ml-auto text-xs text-green-500">
                    Fixed for {categoryConfig.label}
                  </span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {categoryConfig.allowedUnits.map((unit) => (
                    <button
                      key={unit}
                      type="button"
                      onClick={() => setValue("unit", unit, { shouldValidate: true })}
                      className={clsx(
                        "rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        watchedUnit === unit
                          ? "border-green-500 bg-green-50 font-medium text-green-700"
                          : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                      )}
                    >
                      {UNIT_LABELS[unit as Unit]}
                    </button>
                  ))}
                  <input type="hidden" {...register("unit")} />
                </div>
              )}
              {errors.unit && <p className="mt-1 text-xs text-red-500">{errors.unit.message}</p>}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                {categoryConfig.quantityLabel} <span className="text-red-500">*</span>
              </label>
              <input
                {...register("quantity", { valueAsNumber: true })}
                type="number"
                step={isKgOnly ? "0.1" : "1"}
                min="0"
                placeholder={isKgOnly ? "0.0" : "0"}
                className={clsx(
                  "w-full rounded-lg border px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                  errors.quantity ? "border-red-400 bg-red-50" : "border-gray-300"
                )}
              />
              {errors.quantity && (
                <p className="mt-1 text-xs text-red-500">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-gray-50 p-4">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-700">Pricing & Margin</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Buying Price (LKR) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    Rs.
                  </span>
                  <input
                    {...register("buyingPrice", { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    className={clsx(
                      "w-full rounded-lg border py-2.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                      errors.buyingPrice ? "border-red-400 bg-red-50" : "border-gray-300"
                    )}
                  />
                </div>
                {errors.buyingPrice && (
                  <p className="mt-1 text-xs text-red-500">{errors.buyingPrice.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-gray-700">
                  Margin % <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    {...register("marginPercent", { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="e.g. 20"
                    className={clsx(
                      "w-full rounded-lg border py-2.5 pl-3 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-green-500",
                      errors.marginPercent ? "border-red-400 bg-red-50" : "border-gray-300"
                    )}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    %
                  </span>
                </div>
                {errors.marginPercent && (
                  <p className="mt-1 text-xs text-red-500">{errors.marginPercent.message}</p>
                )}
              </div>
            </div>

            {previewSelling > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-gray-200 bg-white p-3 text-center">
                  <p className="text-xs text-gray-500">Buying Price</p>
                  <p className="text-base font-bold text-gray-800">
                    {formatCurrency(parseFloat(String(watchedBuyingPrice)) || 0)}
                  </p>
                </div>
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                  <p className="text-xs text-green-600">Selling Price</p>
                  <p className="text-base font-bold text-green-700">
                    {formatCurrency(previewSelling)}
                  </p>
                </div>
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-center">
                  <p className="text-xs text-blue-600">Profit / Unit</p>
                  <p className="text-base font-bold text-blue-700">
                    +{formatCurrency(previewProfit)}
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-2 text-center font-mono text-xs text-gray-400">
              Selling Price = Buying Price x (1 + Margin% / 100)
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Low Stock Alert Threshold
              <span className="ml-1 font-normal text-gray-400">(default: 5)</span>
            </label>
            <input
              {...register("lowStockAlert", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="5"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <p className="mt-1 text-xs text-gray-400">
              You'll be alerted when stock falls below this number.
            </p>
          </div>

          <div className="flex gap-3 border-t border-gray-100 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-all",
                isSubmitting
                  ? "cursor-not-allowed bg-green-400"
                  : "bg-green-600 hover:bg-green-700 active:scale-95"
              )}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Add Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
