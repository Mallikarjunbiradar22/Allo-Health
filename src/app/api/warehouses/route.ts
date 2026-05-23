import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const warehouses = await prisma.warehouse.findMany({
      include: {
        _count: {
          select: { stocks: true }
        }
      }
    });
    return NextResponse.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
