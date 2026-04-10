import { create } from "zustand";
import toast from "react-hot-toast";
import { Product, CreateProductInput } from "@/types/product";

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
      set({ products: data.products ?? data, isLoading: false });
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
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to add product");
      }
      const newProduct = await res.json();
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
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update product");
      const updated = await res.json();
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
      if (!res.ok) throw new Error("Failed to delete product");
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
