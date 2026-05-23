import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Find reservation
      const reservation = await tx.reservation.findUnique({
        where: { id },
      });

      if (!reservation) {
        throw new Error('NOT_FOUND');
      }

      // Idempotency: already confirmed
      if (reservation.status === 'CONFIRMED') {
        return reservation;
      }

      // Prevent confirming released reservation
      if (reservation.status === 'RELEASED') {
        throw new Error('ALREADY_RELEASED');
      }

      // Expiry check
      if (new Date() > new Date(reservation.expiresAt)) {
        throw new Error('EXPIRED');
      }

      // Update reservation status
      const updatedReservation = await tx.reservation.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
        },
      });

      // Permanently decrement stock
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
      return NextResponse.json(
        { error: 'Reservation not found' },
        { status: 404 }
      );
    }

    if (error.message === 'EXPIRED') {
      return NextResponse.json(
        { error: 'Reservation has expired' },
        { status: 410 }
      );
    }

    if (error.message === 'ALREADY_RELEASED') {
      return NextResponse.json(
        { error: 'Reservation already released' },
        { status: 400 }
      );
    }

    console.error('Error confirming reservation:', error);

    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}