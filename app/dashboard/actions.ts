'use server';

import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { env } from '@/lib/env';

export async function getProducts() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const [products, user] = await Promise.all([
    db.product.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    }),
    db.user.findUnique({
      where: { id: session.userId },
      select: { businessName: true },
    }),
  ]);

  return {
    products: products.map((p) => ({
      id: p.id,
      name: p.name,
      priceKobo: p.priceKobo,
      slug: p.slug,
      description: p.description,
      imageUrl: p.imageUrl,
    })),
    businessName: user?.businessName ?? null,
  };
}

export async function getOrder(id: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const order = await db.order.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, slug: true, priceKobo: true, imageUrl: true, userId: true } },
      payment: true,
    },
  });

  if (!order || order.product.userId !== session.userId) {
    throw new Error('Order not found');
  }

  return {
    id: order.id,
    status: order.status,
    amountKobo: order.amountKobo,
    currency: order.currency,
    txRef: order.txRef,
    buyerName: order.buyerName,
    buyerEmail: order.buyerEmail,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    product: order.product,
    payment: order.payment
      ? { gatewayReference: order.payment.gatewayReference, status: order.payment.status, paidAt: order.payment.paidAt.toISOString() }
      : null,
  };
}

export async function getOrders(statusInput?: string) {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const status = z.string().optional().catch(undefined).parse(statusInput);

  const where =
    !status || status === 'all'
      ? { product: { userId: session.userId } }
      : { product: { userId: session.userId }, status };

  const [orders, counts] = await Promise.all([
    db.order.findMany({
      where,
      include: { product: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
    db.order.groupBy({
      by: ['status'],
      where: { product: { userId: session.userId } },
      _count: true,
    }),
  ]);

  const countMap: Record<string, number> = { all: 0 };
  for (const c of counts) {
    countMap[c.status] = c._count;
    countMap.all += c._count;
  }

  return {
    orders: orders.map((o) => ({
      id: o.id,
      status: o.status,
      amountKobo: o.amountKobo,
      txRef: o.txRef,
      buyerName: o.buyerName,
      buyerEmail: o.buyerEmail,
      updatedAt: o.updatedAt.toISOString(),
      product: o.product,
    })),
    countMap,
  };
}

export async function getDashboardStats() {
  const session = await getSession();
  if (!session) throw new Error('Unauthorized');

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(weekStart);

  const [
    user,
    productCount,
    orderAgg,
    todayAgg,
    thisWeekAgg,
    lastWeekAgg,
    statusBreakdown,
    recentOrders,
    recentProducts,
    lastProduct,
    lastOrder,
    lastFailed,
  ] = await Promise.all([
    db.user.findUnique({
      where: { id: session.userId },
      select: { name: true, businessName: true },
    }),
    db.product.count({ where: { userId: session.userId } }),
    db.order.aggregate({
      where: { product: { userId: session.userId }, status: 'paid' },
      _sum: { amountKobo: true },
      _count: true,
    }),
    db.order.aggregate({
      where: {
        product: { userId: session.userId },
        status: 'paid',
        updatedAt: { gte: todayStart },
      },
      _sum: { amountKobo: true },
      _count: true,
    }),
    db.order.aggregate({
      where: {
        product: { userId: session.userId },
        status: 'paid',
        updatedAt: { gte: weekStart },
      },
      _sum: { amountKobo: true },
      _count: true,
    }),
    db.order.aggregate({
      where: {
        product: { userId: session.userId },
        status: 'paid',
        updatedAt: { gte: lastWeekStart, lt: lastWeekEnd },
      },
      _sum: { amountKobo: true },
      _count: true,
    }),
    db.order.groupBy({
      by: ['status'],
      where: { product: { userId: session.userId } },
      _count: true,
    }),
    db.order.findMany({
      where: { product: { userId: session.userId } },
      include: { product: { select: { name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 5,
    }),
    db.product.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      take: 4,
    }),
    db.product.findFirst({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    db.order.findFirst({
      where: { product: { userId: session.userId } },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
    db.order.findFirst({
      where: { product: { userId: session.userId }, status: 'failed' },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    }),
  ]);

  const counts: { paid: number; pending: number; failed: number } = { paid: 0, pending: 0, failed: 0 };
  for (const s of statusBreakdown) {
    if (s.status === 'paid' || s.status === 'pending' || s.status === 'failed') {
      counts[s.status] = s._count;
    }
  }

  const thisWeekRevenue = thisWeekAgg._sum.amountKobo ?? 0;
  const lastWeekRevenue = lastWeekAgg._sum.amountKobo ?? 0;
  const revenueChange =
    lastWeekRevenue > 0
      ? Math.round(((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100)
      : thisWeekRevenue > 0
        ? 100
        : 0;

  return {
    name: user?.name ?? null,
    businessName: user?.businessName ?? null,
    productCount,
    paidOrderCount: orderAgg._count,
    revenueKobo: orderAgg._sum.amountKobo ?? 0,
    todayOrderCount: todayAgg._count,
    todayRevenueKobo: todayAgg._sum.amountKobo ?? 0,
    thisWeekRevenue,
    revenueChange,
    statusBreakdown: counts,
    pendingCount: counts.pending,
    lastProductAt: lastProduct?.createdAt.toISOString() ?? null,
    lastOrderAt: lastOrder?.updatedAt.toISOString() ?? null,
    lastFailedAt: lastFailed?.updatedAt.toISOString() ?? null,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      status: o.status,
      amountKobo: o.amountKobo,
      txRef: o.txRef,
      buyerName: o.buyerName,
      updatedAt: o.updatedAt.toISOString(),
      product: o.product,
    })),
    recentProducts: recentProducts.map((p) => ({
      id: p.id,
      name: p.name,
      priceKobo: p.priceKobo,
      slug: p.slug,
      imageUrl: p.imageUrl,
    })),
    appUrl: env.NEXT_PUBLIC_APP_URL,
  };
}
