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

      if (reservation.status === 'CONFIRMED') {
        return reservation; // Already confirmed, handle idempotency
      }

      if (reservation.status === 'RELEASED') {
        throw new Error('ALREADY_RELEASED');
      }

      // 2. Check for expiry
      if (new Date() > new Date(reservation.expiresAt)) {
        throw new Error('EXPIRED');
      }

      // 3. Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: { status: 'CONFIRMED' },
      });

      // 4. Permanently decrement stock
      // total decreases because item is sold, reserved decreases because the hold is fulfilled
      await tx.stock.update({
        where: {
          productId_warehouseId: {
            productId: reservation.productId,
            warehouseId: reservation.warehouseId,
          },
        },
        data: {
          total: {
            decrement: reservation.quantity,
          },
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
    if (error.message === 'EXPIRED') {
      return NextResponse.json({ error: 'Reservation has expired' }, { status: 410 });
    }
    if (error.message === 'ALREADY_RELEASED') {
      return NextResponse.json({ error: 'Reservation was already released' }, { status: 400 });
    }

    console.error('Error confirming reservation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
