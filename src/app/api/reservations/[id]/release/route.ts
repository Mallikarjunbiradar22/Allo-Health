import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get the reservation
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new Error('NOT_FOUND');
      }

      if (reservation.status === 'RELEASED') {
        return reservation; // Already released
      }

      if (reservation.status === 'CONFIRMED') {
        throw new Error('ALREADY_CONFIRMED');
      }

      // 2. Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: { status: 'RELEASED' },
      });

      // 3. Release reserved stock
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          reserved: {
            decrement: reservation.quantity,
          },
        },
      });

      return updatedReservation;
    });

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    if (error.message === 'ALREADY_CONFIRMED') {
      return NextResponse.json({ error: 'Cannot release a confirmed reservation' }, { status: 400 });
    }

    console.error('Error releasing reservation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
