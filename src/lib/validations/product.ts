import { z } from "zod";

export const createProductSchema = z
  .object({
    productCode: z
      .string()
      .min(3, "Product code must be at least 3 characters")
      .max(20, "Product code must be at most 20 characters")
      .regex(
        /^[A-Z0-9\-_]+$/,
        "Product code must be uppercase letters, numbers, hyphens or underscores only"
      ),
    name: z
      .string()
      .min(2, "Product name must be at least 2 characters")
      .max(100, "Product name must be at most 100 characters"),
    description: z.string().max(500).optional(),
    category: z.enum([
      "VEGETABLES",
      "FRUITS",
      "GROCERIES",
      "FOODS",
      "COSMETIC",
      "CLOTHES",
      "OTHERS",
    ]),
    unit: z.enum(["KG", "PIECE", "LITRE", "PACK", "DOZEN"]),
    buyingPrice: z
      .number({ invalid_type_error: "Buying price must be a number" })
      .positive("Buying price must be greater than 0")
      .max(999999, "Price too high"),
    marginPercent: z
      .number({ invalid_type_error: "Margin must be a number" })
      .min(0, "Margin cannot be negative")
      .max(1000, "Margin cannot exceed 1000%"),
    quantity: z
      .number({ invalid_type_error: "Quantity must be a number" })
      .positive("Quantity must be greater than 0"),
    lowStockAlert: z
      .number()
      .min(0, "Low stock alert cannot be negative")
      .optional()
      .default(5),
  })
  .refine(
    (data) => {
      if (data.category === "VEGETABLES" || data.category === "FRUITS") {
        return data.unit === "KG";
      }
      return true;
    },
    {
      message: "Vegetables and Fruits must use KG as unit",
      path: ["unit"],
    }
  );

export type CreateProductSchema = z.infer<typeof createProductSchema>;
