import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { calculateSellingPrice } from "@/lib/utils/pricing";

const prisma = new PrismaClient();

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await req.json();

    let sellingPrice: number | undefined;

    if (body.buyingPrice !== undefined || body.marginPercent !== undefined) {
      const current = await prisma.product.findUnique({
        where: { id },
      });

      if (!current) {
        return NextResponse.json({ message: "Product not found" }, { status: 404 });
      }

      const buyingPrice = body.buyingPrice ?? current.buyingPrice;
      const marginPercent = body.marginPercent ?? current.marginPercent;
      sellingPrice = calculateSellingPrice(buyingPrice, marginPercent);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...body,
        ...(sellingPrice !== undefined && { sellingPrice }),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch {
    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 }
    );
  }
}
