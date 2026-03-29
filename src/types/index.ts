// ============================================================
// Shared TypeScript Types
// ============================================================

import { Role, Category, PaymentMethod } from '@prisma/client';

// ── API Response wrapper ──
export interface ApiResponse<T = unknown> {
    data?: T;
    error?: string;
    message?: string;
}

// ── Cart types (frontend) ──
export interface CartItem {
    productId: string;
    name: string;
    price: number;
    costPrice: number;
    quantity: number;
    maxQuantity: number; // Available stock
    total: number;
}

// ── Dashboard stats ──
export interface DashboardStats {
    todaySales: number;
    todayBills: number;
    todayProfit: number;
    totalProducts: number;
    lowStockCount: number;
    expiringCount: number;
}

// ── AI types ──
export interface StockPrediction {
    productId: string;
    productName: string;
    currentStock: number;
    avgDailySales: number;
    daysUntilStockout: number;
    predictedStockoutDate: string;
    urgency: 'critical' | 'warning' | 'ok';
}

export interface SalesInsight {
    type: 'top_selling' | 'low_selling' | 'trending_up' | 'trending_down';
    productName: string;
    message: string;
    value: number;
}

export interface SmartAlert {
    id: string;
    type: 'stockout' | 'expiry' | 'low_selling' | 'reorder';
    severity: 'critical' | 'warning' | 'info';
    title: string;
    message: string;
    productId?: string;
    productName?: string;
}

// ── Report types ──
export interface SalesReport {
    date: string;
    totalSales: number;
    totalBills: number;
    totalProfit: number;
    topProduct: string;
}

export interface CustomerInsight {
    customerId: string;
    customerName: string;
    totalSpent: number;
    visitCount: number;
    lastVisit: string;
    favoriteProducts: string[];
}
