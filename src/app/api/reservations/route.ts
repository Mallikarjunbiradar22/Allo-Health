import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { addMinutes } from 'date-fns';

const reservationSchema = z.object({
  productId: z.string(),
  warehouseId: z.string(),
  quantity: z.number().int().positive(),
});

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = reservationSchema.parse(body);
    const { productId, warehouseId, quantity } = validatedData;

    const idempotencyKey = req.headers.get('Idempotency-Key');

    // Handle Idempotency (Bonus)
    if (idempotencyKey) {
      const existingReservation = await prisma.reservation.findUnique({
        where: { idempotencyKey },
      });
      if (existingReservation) {
        return NextResponse.json(existingReservation);
      }
    }

    // Reservation window (e.g., 10 minutes)
    const expiresAt = addMinutes(new Date(), 10);

    // Atomic transaction to handle concurrency
    const result = await prisma.$transaction(async (tx) => {
      // Use raw SQL to atomically check stock and increment reserved count
      // This is the most reliable way to handle concurrency in Postgres
      const updatedRows = await tx.$executeRaw`
        UPDATE "Stock"
        SET "reserved" = "reserved" + ${quantity}, "updatedAt" = NOW()
        WHERE "productId" = ${productId}
          AND "warehouseId" = ${warehouseId}
          AND "total" >= "reserved" + ${quantity}
      `;

      if (updatedRows === 0) {
        throw new Error('INSUFFICIENT_STOCK');
      }

      // Create the reservation record
      const reservation = await tx.reservation.create({
        data: {
          productId,
          warehouseId,
          quantity,
          expiresAt,
          idempotencyKey,
          status: 'PENDING',
        },
      });

      return reservation;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    if (error.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'Not enough stock available' }, { status: 409 });
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    // Handle Prisma record not found (e.g., wrong productId/warehouseId)
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Stock record not found' }, { status: 404 });
    }

    console.error('Error creating reservation:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
