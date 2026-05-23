import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cleanupExpiredReservations } from '@/lib/reservations';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // Lazy cleanup of expired reservations before fetching products
    try {
      await cleanupExpiredReservations();
    } catch (cleanupError) {
      console.error('Cleanup error (non-fatal):', cleanupError);
    }

    const products = await prisma.product.findMany({
      include: {
        stocks: {
          include: {
            warehouse: true,
          },
        },
      },
    });

    // Map to include calculated available stock
    const productsWithAvailableStock = products.map((product) => ({
      ...product,
      stocks: product.stocks.map((stock) => ({
        ...stock,
        available: stock.total - stock.reserved,
      })),
    }));

    return NextResponse.json(productsWithAvailableStock);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
