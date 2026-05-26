'use server';

import { db } from '@/lib/db';

export async function checkOrderStatus(txRef: string) {
  const order = await db.order.findUnique({
    where: { txRef },
    select: { status: true },
  });

  if (!order) return { status: 'not_found' };
  return { status: order.status };
}
