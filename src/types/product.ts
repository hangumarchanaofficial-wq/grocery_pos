export type Category =
  | "VEGETABLES"
  | "FRUITS"
  | "GROCERY_ITEMS"
  | "FOODS"
  | "COSMETIC"
  | "CLOTHES"
  | "OTHERS";

export type Unit = "KG" | "PIECE" | "LITRE" | "PACK" | "DOZEN";

export interface Product {
  id: string;
  productCode: string;
  name: string;
  description?: string;
  category: Category;
  unit: Unit;
  buyingPrice: number;
  marginPercent: number;
  sellingPrice: number;
  quantity: number;
  lowStockAlert: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductInput {
  productCode: string;
  name: string;
  description?: string;
  category: Category;
  unit: Unit;
  buyingPrice: number;
  marginPercent: number;
  quantity: number;
  lowStockAlert?: number;
}

export const CATEGORY_CONFIG: Record<
  Category,
  {
    label: string;
    allowedUnits: Unit[];
    defaultUnit: Unit;
    quantityLabel: string;
    icon: string;
  }
> = {
  VEGETABLES: {
    label: "Vegetables",
    allowedUnits: ["KG"],
    defaultUnit: "KG",
    quantityLabel: "Quantity (kg)",
    icon: "🥦",
  },
  FRUITS: {
    label: "Fruits",
    allowedUnits: ["KG"],
    defaultUnit: "KG",
    quantityLabel: "Quantity (kg)",
    icon: "🍎",
  },
  GROCERY_ITEMS: {
    label: "Grocery Items",
    allowedUnits: ["PIECE", "PACK", "LITRE", "DOZEN"],
    defaultUnit: "PIECE",
    quantityLabel: "Quantity",
    icon: "🛒",
  },
  FOODS: {
    label: "Foods",
    allowedUnits: ["PIECE", "PACK", "LITRE", "KG"],
    defaultUnit: "PACK",
    quantityLabel: "Quantity",
    icon: "🍱",
  },
  COSMETIC: {
    label: "Cosmetic",
    allowedUnits: ["PIECE", "PACK"],
    defaultUnit: "PIECE",
    quantityLabel: "Quantity",
    icon: "💄",
  },
  CLOTHES: {
    label: "Clothes",
    allowedUnits: ["PIECE"],
    defaultUnit: "PIECE",
    quantityLabel: "Quantity (pcs)",
    icon: "👕",
  },
  OTHERS: {
    label: "Others",
    allowedUnits: ["PIECE", "PACK", "KG", "LITRE", "DOZEN"],
    defaultUnit: "PIECE",
    quantityLabel: "Quantity",
    icon: "📦",
  },
};

export const UNIT_LABELS: Record<Unit, string> = {
  KG: "Kilogram (kg)",
  PIECE: "Piece (pcs)",
  LITRE: "Litre (L)",
  PACK: "Pack",
  DOZEN: "Dozen",
};
