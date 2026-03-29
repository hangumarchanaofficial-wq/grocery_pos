// ============================================================
// Product Table — Displays all products with actions
// ============================================================

'use client';

import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Edit, Trash2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

interface Product {
    id: string;
    name: string;
    barcode: string | null;
    category: string;
    price: number;
    costPrice: number;
    quantity: number;
    unit: string;
    minStock: number;
    expiryDate: string | null;
}

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
    userRole: string;
}

export default function ProductTable({ products, onEdit, onDelete, userRole }: ProductTableProps) {
    const getCategoryEmoji = (cat: string) => {
        return CATEGORIES.find((c) => c.value === cat)?.emoji || '📦';
    };

    const getStockBadge = (product: Product) => {
        if (product.quantity === 0) return <Badge variant="danger">Out of Stock</Badge>;
        if (product.quantity <= product.minStock) return <Badge variant="warning">Low Stock</Badge>;
        return <Badge variant="success">In Stock</Badge>;
    };

    const getExpiryBadge = (expiryDate: string | null) => {
        if (!expiryDate) return null;
        const days = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / 86400000);
        if (days <= 0) return <Badge variant="danger">Expired</Badge>;
        if (days <= 3) return <Badge variant="warning">{days}d left</Badge>;
        return null;
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
                <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Product</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Cost</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Stock</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                            <div>
                                <p className="font-medium text-gray-900">{product.name}</p>
                                {product.barcode && (
                                    <p className="text-xs text-gray-400">{product.barcode}</p>
                                )}
                            </div>
                        </td>
                        <td className="px-4 py-3">
                <span className="text-sm">
                  {getCategoryEmoji(product.category)} {product.category}
                </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                            {formatCurrency(product.price)}
                        </td>
                        <td className="px-4 py-3 text-right text-gray-500">
                            {formatCurrency(product.costPrice)}
                        </td>
                        <td className="px-4 py-3 text-center">
                <span className="font-medium">
                  {product.quantity} {product.unit}
                </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <div className="flex flex-col items-center gap-1">
                                {getStockBadge(product)}
                                {getExpiryBadge(product.expiryDate)}
                            </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEdit(product)}
                                >
                                    <Edit size={15} />
                                </Button>
                                {userRole === 'OWNER' && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onDelete(product.id)}
                                        className="text-red-500 hover:bg-red-50"
                                    >
                                        <Trash2 size={15} />
                                    </Button>
                                )}
                            </div>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}
