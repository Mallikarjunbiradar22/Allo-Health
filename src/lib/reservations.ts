import { prisma } from './prisma';

/**
 * Automatically releases all expired PENDING reservations.
 * This can be called lazily or by a cron job.
 */
export async function cleanupExpiredReservations() {
  const now = new Date();

  // Find all PENDING reservations that have expired
  const expiredReservations = await prisma.reservation.findMany({
    where: {
      status: 'PENDING',
      expiresAt: {
        lt: now,
      },
    },
  });

  if (expiredReservations.length === 0) {
    return 0;
  }

  // Release them in a transaction
  await prisma.$transaction(async (tx) => {
    for (const reservation of expiredReservations) {
      // Update status to RELEASED
      await tx.reservation.update({
        where: { id: reservation.id },
        data: { status: 'RELEASED' },
      });

      // Release stock
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
    }
  });

  return expiredReservations.length;
}
