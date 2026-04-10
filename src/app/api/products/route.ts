import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createProductSchema } from "@/lib/validations/product";
import { calculateSellingPrice } from "@/lib/utils/pricing";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const products = await prisma.product.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { productCode: { contains: search, mode: "insensitive" } },
          ],
        }),
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const parsed = createProductSchema.safeParse({
      ...body,
      buyingPrice: parseFloat(body.buyingPrice),
      marginPercent: parseFloat(body.marginPercent),
      quantity: parseFloat(body.quantity),
      lowStockAlert: body.lowStockAlert ? parseFloat(body.lowStockAlert) : 5,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.errors[0].message, errors: parsed.error.errors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.product.findUnique({
      where: { productCode: data.productCode },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Product code already exists. Please use a unique code." },
        { status: 409 }
      );
    }

    const sellingPrice = calculateSellingPrice(
      data.buyingPrice,
      data.marginPercent
    );

    const product = await prisma.product.create({
      data: {
        ...data,
        sellingPrice,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
