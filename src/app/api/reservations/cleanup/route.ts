import { NextResponse } from 'next/server';
import { cleanupExpiredReservations } from '@/lib/reservations';

export async function POST() {
  try {
    const count = await cleanupExpiredReservations();
    return NextResponse.json({ releasedCount: count });
  } catch (error) {
    console.error('Error in cleanup cron:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
