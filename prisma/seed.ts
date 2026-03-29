// ============================================================
// Seed Script — Populates database with sample data
// Run: npm run db:seed
// ============================================================

import { PrismaClient, Category, Role, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // ── Clean existing data ──
    await prisma.billItem.deleteMany();
    await prisma.bill.deleteMany();
    await prisma.product.deleteMany();
    await prisma.customer.deleteMany();
    await prisma.user.deleteMany();

    // ── Create Users ──
    const hashedPassword = await bcrypt.hash('password123', 12);

    const owner = await prisma.user.create({
        data: {
            name: 'Raj Kumar',
            email: 'owner@grocerypos.com',
            password: hashedPassword,
            role: Role.OWNER,
        },
    });

    const manager = await prisma.user.create({
        data: {
            name: 'Priya Singh',
            email: 'manager@grocerypos.com',
            password: hashedPassword,
            role: Role.MANAGER,
        },
    });

    const cashier = await prisma.user.create({
        data: {
            name: 'Amit Patel',
            email: 'cashier@grocerypos.com',
            password: hashedPassword,
            role: Role.CASHIER,
        },
    });

    console.log('✅ Users created');

    // ── Create Products ──
    const now = new Date();
    const daysFromNow = (d: number) => new Date(now.getTime() + d * 86400000);

    const products = await Promise.all([
        // VEGETABLES
        prisma.product.create({
            data: {
                name: 'Tomatoes', barcode: '1001001001', category: Category.VEGETABLES,
                price: 40, costPrice: 25, quantity: 50, unit: 'kg',
                minStock: 10, expiryDate: daysFromNow(5),
            },
        }),
        prisma.product.create({
            data: {
                name: 'Onions', barcode: '1001001002', category: Category.VEGETABLES,
                price: 35, costPrice: 20, quantity: 8, unit: 'kg', // LOW STOCK
                minStock: 15, expiryDate: daysFromNow(10),
            },
        }),
        prisma.product.create({
            data: {
                name: 'Potatoes', barcode: '1001001003', category: Category.VEGETABLES,
                price: 30, costPrice: 18, quantity: 100, unit: 'kg',
                minStock: 20, expiryDate: daysFromNow(15),
            },
        }),
        prisma.product.create({
            data: {
                name: 'Spinach', barcode: '1001001004', category: Category.VEGETABLES,
                price: 25, costPrice: 15, quantity: 3, unit: 'kg', // VERY LOW
                minStock: 5, expiryDate: daysFromNow(2), // EXPIRING SOON
            },
        }),
        prisma.product.create({
            data: {
                name: 'Carrots', barcode: '1001001005', category: Category.VEGETABLES,
                price: 45, costPrice: 30, quantity: 30, unit: 'kg',
                minStock: 10, expiryDate: daysFromNow(7),
            },
        }),

        // FRUITS
        prisma.product.create({
            data: {
                name: 'Bananas', barcode: '2001001001', category: Category.FRUITS,
                price: 50, costPrice: 30, quantity: 40, unit: 'dozen',
                minStock: 10, expiryDate: daysFromNow(3),
            },
        }),
        prisma.product.create({
            data: {
                name: 'Apples', barcode: '2001001002', category: Category.FRUITS,
                price: 180, costPrice: 120, quantity: 25, unit: 'kg',
                minStock: 8, expiryDate: daysFromNow(12),
            },
        }),
        prisma.product.create({
            data: {
                name: 'Mangoes', barcode: '2001001003', category: Category.FRUITS,
                price: 200, costPrice: 140, quantity: 15, unit: 'kg',
                minStock: 5, expiryDate: daysFromNow(4),
            },
        }),

        // GROCERIES
        prisma.product.create({
            data: {
                name: 'Basmati Rice (5kg)', barcode: '3001001001', category: Category.GROCERIES,
                price: 450, costPrice: 350, quantity: 60, unit: 'pcs',
                minStock: 10,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Toor Dal (1kg)', barcode: '3001001002', category: Category.GROCERIES,
                price: 160, costPrice: 120, quantity: 45, unit: 'pcs',
                minStock: 8,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Sunflower Oil (1L)', barcode: '3001001003', category: Category.GROCERIES,
                price: 180, costPrice: 140, quantity: 35, unit: 'pcs',
                minStock: 10,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Sugar (1kg)', barcode: '3001001004', category: Category.GROCERIES,
                price: 50, costPrice: 38, quantity: 80, unit: 'pcs',
                minStock: 15,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Wheat Flour (5kg)', barcode: '3001001005', category: Category.GROCERIES,
                price: 280, costPrice: 220, quantity: 40, unit: 'pcs',
                minStock: 8,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Tea (250g)', barcode: '3001001006', category: Category.GROCERIES,
                price: 120, costPrice: 85, quantity: 55, unit: 'pcs',
                minStock: 10,
            },
        }),

        // PLANTS
        prisma.product.create({
            data: {
                name: 'Tulsi Plant', barcode: '4001001001', category: Category.PLANTS,
                price: 80, costPrice: 40, quantity: 20, unit: 'pcs',
                minStock: 5,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Money Plant', barcode: '4001001002', category: Category.PLANTS,
                price: 150, costPrice: 70, quantity: 12, unit: 'pcs',
                minStock: 3,
            },
        }),

        // CLOTHES
        prisma.product.create({
            data: {
                name: 'Cotton T-Shirt', barcode: '5001001001', category: Category.CLOTHES,
                price: 350, costPrice: 200, quantity: 30, unit: 'pcs',
                minStock: 5,
            },
        }),
        prisma.product.create({
            data: {
                name: 'Handloom Towel', barcode: '5001001002', category: Category.CLOTHES,
                price: 120, costPrice: 70, quantity: 50, unit: 'pcs',
                minStock: 10,
            },
        }),
    ]);

    console.log(`✅ ${products.length} products created`);

    // ── Create Customers ──
    const customers = await Promise.all([
        prisma.customer.create({
            data: { name: 'Sunita Devi', phone: '9876543210', email: 'sunita@email.com' },
        }),
        prisma.customer.create({
            data: { name: 'Ramesh Gupta', phone: '9876543211' },
        }),
        prisma.customer.create({
            data: { name: 'Meera Sharma', phone: '9876543212', email: 'meera@email.com' },
        }),
        prisma.customer.create({
            data: { name: 'Vikram Joshi', phone: '9876543213' },
        }),
        prisma.customer.create({
            data: { name: 'Lakshmi Nair', phone: '9876543214' },
        }),
    ]);

    console.log(`✅ ${customers.length} customers created`);

    // ── Create Sample Bills (past 30 days) ──
    // This gives the AI engine historical data to work with

    const billData = [];
    for (let daysAgo = 30; daysAgo >= 0; daysAgo--) {
        const billDate = new Date(now.getTime() - daysAgo * 86400000);
        // Random number of bills per day (2-6)
        const numBills = Math.floor(Math.random() * 5) + 2;

        for (let b = 0; b < numBills; b++) {
            const customer = customers[Math.floor(Math.random() * customers.length)];
            const numItems = Math.floor(Math.random() * 4) + 1;
            const selectedProducts: typeof products[0][] = [];

            for (let i = 0; i < numItems; i++) {
                const prod = products[Math.floor(Math.random() * products.length)];
                if (!selectedProducts.find(p => p.id === prod.id)) {
                    selectedProducts.push(prod);
                }
            }

            const items = selectedProducts.map(p => {
                const qty = Math.floor(Math.random() * 3) + 1;
                return {
                    productId: p.id,
                    quantity: qty,
                    price: p.price,
                    costPrice: p.costPrice,
                    total: p.price * qty,
                };
            });

            const subtotal = items.reduce((sum, item) => sum + item.total, 0);
            const tax = Math.round(subtotal * 0.05 * 100) / 100; // 5% tax
            const total = subtotal + tax;

            const methods: PaymentMethod[] = ['CASH', 'CARD', 'QR'];

            billData.push({
                billNumber: `BILL-${billDate.toISOString().slice(0, 10).replace(/-/g, '')}-${String(b + 1).padStart(3, '0')}`,
                subtotal,
                tax,
                discount: 0,
                total,
                paymentMethod: methods[Math.floor(Math.random() * methods.length)],
                paidAmount: total,
                changeAmount: 0,
                customerId: Math.random() > 0.3 ? customer.id : null,
                userId: [owner.id, cashier.id][Math.floor(Math.random() * 2)],
                createdAt: billDate,
                items,
            });
        }
    }

    // Insert bills with their items
    for (const bill of billData) {
        const { items, ...billFields } = bill;
        await prisma.bill.create({
            data: {
                ...billFields,
                items: {
                    create: items,
                },
            },
        });
    }

    console.log(`✅ ${billData.length} bills created with items`);
    console.log('');
    console.log('🎉 Seed complete!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Owner:   owner@grocerypos.com   / password123');
    console.log('  Manager: manager@grocerypos.com / password123');
    console.log('  Cashier: cashier@grocerypos.com / password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
