// ============================================================
// Application Constants — single source for product categories
// ============================================================

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'GroceryPOS';

/** Canonical DB + app category values (aligned with `types/product` Category). */
export const CATEGORIES = [
  { value: 'VEGETABLES', label: 'Vegetables', emoji: '🥬' },
  { value: 'FRUITS', label: 'Fruits', emoji: '🍎' },
  { value: 'GROCERIES', label: 'Grocery items', emoji: '🛒' },
  { value: 'FOODS', label: 'Foods', emoji: '🍱' },
  { value: 'COSMETIC', label: 'Cosmetic', emoji: '💄' },
  { value: 'CLOTHES', label: 'Clothes', emoji: '👕' },
  { value: 'OTHERS', label: 'Others', emoji: '📦' },
] as const;

export const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash', icon: 'Banknote' },
  { value: 'CARD', label: 'Card', icon: 'CreditCard' },
  { value: 'QR', label: 'QR Code', icon: 'QrCode' },
] as const;

export const ROLES = [
  { value: 'OWNER', label: 'Owner' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'CASHIER', label: 'Cashier' },
] as const;

export const TAX_RATE = 0.05; // 5% GST

export const UNITS = ['pcs', 'kg', 'g', 'litre', 'ml', 'dozen', 'pack'] as const;
