// ============================================================
// Billing API
// GET  /api/billing   — List recent bills
// POST /api/billing   — Create a new bill (the core POS action)
// ============================================================

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { errorResponse, successResponse, generateBillNumber } from '@/lib/utils';
import { TAX_RATE } from '@/lib/constants';

export async function GET(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const date = searchParams.get('date');

        const where: Record<string, unknown> = {};
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1);
            where.createdAt = { gte: start, lt: end };
        }

        const [bills, total] = await Promise.all([
            prisma.bill.findMany({
                where,
                include: {
                    customer: { select: { name: true, phone: true } },
                    user: { select: { name: true } },
                    items: {
                        include: { product: { select: { name: true } } },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.bill.count({ where }),
        ]);

        return successResponse({
            bills,
            pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        });
    } catch (error) {
        console.error('Bills GET error:', error);
        return errorResponse('Internal server error', 500);
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = getUserFromRequest(req);
        if (!user) return errorResponse('Unauthorized', 401);

        const { items, customerId, paymentMethod, discount, paidAmount } = await req.json();

        // Validate items
        if (!items || !Array.length || items.length === 0) {
            return errorResponse('At least one item is required', 400);
        }

        // Validate all products exist and have sufficient stock
        const productIds = items.map((item: { productId: string }) => item.productId);
        const products = await prisma.product.findMany({
            where: { id: { in: productIds } },
        });

        const productMap = new Map(products.map((p) => [p.id, p]));

        for (const item of items) {
            const product = productMap.get(item.productId);
            if (!product) {
                return errorResponse(`Product not found: ${item.productId}`, 404);
            }
            if (product.quantity < item.quantity) {
                return errorResponse(
                    `Insufficient stock for "${product.name}". Available: ${product.quantity}`,
                    400
                );
            }
        }

        // Calculate totals
        const billItems = items.map((item: { productId: string; quantity: number }) => {
            const product = productMap.get(item.productId)!;
            return {
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
                costPrice: product.costPrice,
                total: product.price * item.quantity,
            };
        });

        const subtotal = billItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0);
        const discountAmount = discount || 0;
        const tax = Math.round((subtotal - discountAmount) * TAX_RATE * 100) / 100;
        const total = subtotal - discountAmount + tax;
        const paid = paidAmount || total;
        const change = Math.max(0, paid - total);

        // Generate bill number — count today's bills for sequence
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayBillCount = await prisma.bill.count({
            where: { createdAt: { gte: todayStart } },
        });
        const billNumber = generateBillNumber(todayBillCount + 1);

        // Create bill + items + reduce stock — all in a transaction
        const bill = await prisma.$transaction(async (tx) => {
            // 1. Create the bill with items
            const newBill = await tx.bill.create({
                data: {
                    billNumber,
                    subtotal,
                    tax,
                    discount: discountAmount,
                    total,
                    paymentMethod: paymentMethod || 'CASH',
                    paidAmount: paid,
                    changeAmount: change,
                    customerId: customerId || null,
                    userId: user.userId,
                    items: {
                        create: billItems,
                    },
                },
                include: {
                    items: {
                        include: { product: { select: { name: true } } },
                    },
                    customer: { select: { name: true, phone: true } },
                    user: { select: { name: true } },
                },
            });

            // 2. Reduce stock for each product
            for (const item of billItems) {
                await tx.product.update({
                    where: { id: item.productId },
                    data: { quantity: { decrement: item.quantity } },
                });
            }

            return newBill;
        });

        return successResponse(bill, 201);
    } catch (error) {
        console.error('Billing POST error:', error);
        return errorResponse('Internal server error', 500);
    }
}
