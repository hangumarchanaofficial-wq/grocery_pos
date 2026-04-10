import { create } from "zustand";
import toast from "react-hot-toast";
import { Product, CreateProductInput } from "@/types/product";
import { calculateMarginFromPrices, calculateSellingPrice } from "@/lib/utils/pricing";

type ApiProduct = Record<string, any>;

const API_TO_APP_CATEGORY: Record<string, Product["category"]> = {
  VEGETABLES: "VEGETABLES",
  FRUITS: "FRUITS",
  GROCERIES: "GROCERY_ITEMS",
  GROCERY_ITEMS: "GROCERY_ITEMS",
  FOODS: "FOODS",
  COSMETIC: "COSMETIC",
  CLOTHES: "CLOTHES",
  OTHERS: "OTHERS",
  PLANTS: "OTHERS",
};

const APP_TO_API_CATEGORY: Record<Product["category"], string> = {
  VEGETABLES: "VEGETABLES",
  FRUITS: "FRUITS",
  GROCERY_ITEMS: "GROCERIES",
  FOODS: "FOODS",
  COSMETIC: "COSMETIC",
  CLOTHES: "CLOTHES",
  OTHERS: "OTHERS",
};

const API_TO_APP_UNIT: Record<string, Product["unit"]> = {
  kg: "KG",
  KG: "KG",
  pcs: "PIECE",
  piece: "PIECE",
  PIECE: "PIECE",
  litre: "LITRE",
  LITRE: "LITRE",
  pack: "PACK",
  PACK: "PACK",
  dozen: "DOZEN",
  DOZEN: "DOZEN",
};

const APP_TO_API_UNIT: Record<Product["unit"], string> = {
  KG: "kg",
  PIECE: "pcs",
  LITRE: "litre",
  PACK: "pack",
  DOZEN: "dozen",
};

function mapApiProduct(product: ApiProduct): Product {
  const buyingPrice = Number(product.buyingPrice ?? product.costPrice ?? 0);
  const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);

  return {
    id: String(product.id),
    productCode: String(product.productCode ?? product.barcode ?? ""),
    name: String(product.name ?? ""),
    description: product.description ?? undefined,
    category: API_TO_APP_CATEGORY[String(product.category)] ?? "OTHERS",
    unit: API_TO_APP_UNIT[String(product.unit)] ?? "PIECE",
    buyingPrice,
    marginPercent: Number(
      product.marginPercent ?? calculateMarginFromPrices(buyingPrice, sellingPrice)
    ),
    sellingPrice,
    quantity: Number(product.quantity ?? 0),
    lowStockAlert: Number(product.lowStockAlert ?? product.minStock ?? 5),
    isActive: Boolean(product.isActive ?? product.active ?? true),
    createdAt: String(product.createdAt ?? product.created_at ?? new Date().toISOString()),
    updatedAt: String(product.updatedAt ?? product.updated_at ?? new Date().toISOString()),
  };
}

function mapCreateProductInput(data: CreateProductInput) {
  return {
    name: data.name,
    barcode: data.productCode || null,
    category: APP_TO_API_CATEGORY[data.category] ?? data.category,
    price: calculateSellingPrice(data.buyingPrice, data.marginPercent),
    costPrice: data.buyingPrice,
    quantity: data.quantity,
    unit: APP_TO_API_UNIT[data.unit] ?? "pcs",
    minStock: data.lowStockAlert ?? 5,
  };
}

function mapUpdateProductInput(
  data: Partial<CreateProductInput>,
  currentProduct?: Product
) {
  const payload: Record<string, unknown> = {};

  if (data.name !== undefined) payload.name = data.name;
  if (data.productCode !== undefined) payload.barcode = data.productCode || null;
  if (data.category !== undefined) payload.category = APP_TO_API_CATEGORY[data.category] ?? data.category;
  if (data.buyingPrice !== undefined || data.marginPercent !== undefined) {
    const buyingPrice = Number(data.buyingPrice ?? currentProduct?.buyingPrice ?? 0);
    const marginPercent = Number(data.marginPercent ?? currentProduct?.marginPercent ?? 0);
    if (data.buyingPrice !== undefined) payload.costPrice = buyingPrice;
    payload.price = calculateSellingPrice(buyingPrice, marginPercent);
  }
  if (data.quantity !== undefined) payload.quantity = data.quantity;
  if (data.unit !== undefined) payload.unit = APP_TO_API_UNIT[data.unit] ?? "pcs";
  if (data.lowStockAlert !== undefined) payload.minStock = data.lowStockAlert;

  return payload;
}

interface ProductStore {
  products: Product[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (data: CreateProductInput) => Promise<boolean>;
  updateProduct: (
    id: string,
    data: Partial<CreateProductInput>
  ) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  generateProductCode: (category: string) => string;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      const products = (data.products ?? data).map(mapApiProduct);
      set({ products, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      toast.error("Failed to load products");
    }
  },

  addProduct: async (data) => {
    set({ isSubmitting: true });
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapCreateProductInput(data)),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Failed to add product");
      }
      const newProduct = mapApiProduct(await res.json());
      set((state) => ({
        products: [newProduct, ...state.products],
        isSubmitting: false,
      }));
      toast.success("Product added successfully!");
      return true;
    } catch (err: any) {
      set({ isSubmitting: false });
      toast.error(err.message || "Failed to add product");
      return false;
    }
  },

  updateProduct: async (id, data) => {
    set({ isSubmitting: true });
    try {
      const currentProduct = get().products.find((product) => product.id === id);
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapUpdateProductInput(data, currentProduct)),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Failed to update product");
      }
      const updated = mapApiProduct(await res.json());
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updated : p)),
        isSubmitting: false,
      }));
      toast.success("Product updated!");
      return true;
    } catch (err: any) {
      set({ isSubmitting: false });
      toast.error(err.message);
      return false;
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || err.message || "Failed to delete product");
      }
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
      toast.success("Product deleted!");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    }
  },

  generateProductCode: (category: string) => {
    const { products } = get();
    const prefixes: Record<string, string> = {
      VEGETABLES: "VEG",
      FRUITS: "FRT",
      GROCERY_ITEMS: "GRC",
      FOODS: "FDS",
      COSMETIC: "CSM",
      CLOTHES: "CLT",
      OTHERS: "OTH",
    };
    const prefix = prefixes[category] || "PRD";
    const categoryProducts = products.filter((p) => p.category === category);
    const count = String(categoryProducts.length + 1).padStart(3, "0");
    return `${prefix}-${count}`;
  },
}));
