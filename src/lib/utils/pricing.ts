/**
 * Calculate selling price from buying price and margin percentage
 * Formula: Selling Price = Buying Price × (1 + Margin% / 100)
 */
export function calculateSellingPrice(
  buyingPrice: number,
  marginPercent: number
): number {
  return parseFloat((buyingPrice * (1 + marginPercent / 100)).toFixed(2));
}

/**
 * Calculate profit per unit
 */
export function calculateProfit(
  buyingPrice: number,
  sellingPrice: number
): number {
  return parseFloat((sellingPrice - buyingPrice).toFixed(2));
}

/**
 * Calculate actual margin % from buying and selling price
 */
export function calculateMarginFromPrices(
  buyingPrice: number,
  sellingPrice: number
): number {
  if (buyingPrice === 0) return 0;
  return parseFloat(
    (((sellingPrice - buyingPrice) / buyingPrice) * 100).toFixed(2)
  );
}

/**
 * Auto-generate a product code based on category and a counter
 * e.g., VEG-001, FRT-002, GRC-003
 */
export function generateProductCode(
  category: string,
  existingCount: number
): string {
  const prefixes: Record<string, string> = {
    VEGETABLES: "VEG",
    FRUITS: "FRT",
    GROCERIES: "GRC",
    FOODS: "FDS",
    COSMETIC: "CSM",
    CLOTHES: "CLT",
    OTHERS: "OTH",
  };
  const prefix = prefixes[category] || "PRD";
  const count = String(existingCount + 1).padStart(3, "0");
  return `${prefix}-${count}`;
}

export { formatCurrency } from "@/lib/utils";
