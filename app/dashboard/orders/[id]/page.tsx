import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { Card } from '@/components/ui/Card';
import Image from 'next/image';
import { ArrowLeft, Package } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { env } from '@/lib/env';
import { formatPrice } from '@/lib/format';
import { OrderActions } from './OrderActions';

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-success/15 text-success',
  pending: 'bg-warning/15 text-warning',
  failed: 'bg-error/15 text-error',
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect('/auth');

  const { id } = await params;

  const order = await db.order.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, slug: true, priceKobo: true, imageUrl: true, userId: true } },
      payment: true,
    },
  });

  if (!order || order.product.userId !== session.userId) {
    notFound();
  }

  const paymentLink = `${env.NEXT_PUBLIC_APP_URL}/p/${order.product.slug}`;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard?tab=orders"
          className="p-2 rounded-full hover:bg-surface text-ink-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-h1 font-bold text-ink">Order Details</h1>
          <p className="text-body-sm text-ink-muted font-mono">Ref: {order.txRef}</p>
        </div>
        <div className="ml-auto">
          <span className={`inline-block px-3 py-1 rounded-full text-label-sm font-semibold ${STATUS_COLORS[order.status] || ''}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="space-y-4">
          <h2 className="text-h2 font-bold text-ink">Product</h2>
          <div className="flex items-center gap-3">
            {order.product.imageUrl ? (
              <Image src={order.product.imageUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
                <Package className="h-6 w-6 text-ink-subtle" />
              </div>
            )}
            <div className="min-w-0">
              <p className="text-body font-semibold text-ink">{order.product.name}</p>
              <p className="text-body-sm text-brand font-bold">{formatPrice(order.amountKobo)}</p>
            </div>
          </div>
          <OrderActions paymentLink={paymentLink} />
        </Card>

        <Card className="space-y-3">
          <h2 className="text-h2 font-bold text-ink">Buyer</h2>
          <div className="space-y-1">
            <p className="text-body font-medium text-ink">{order.buyerName ?? 'Anonymous'}</p>
            <p className="text-body-sm text-ink-muted">{order.buyerEmail}</p>
          </div>
        </Card>
      </div>

      <Card className="space-y-3">
        <h2 className="text-h2 font-bold text-ink">Payment Information</h2>
        <div className="grid grid-cols-2 gap-4 text-body-sm">
          <div>
            <p className="text-ink-muted">Amount</p>
            <p className="text-body font-bold text-ink">{formatPrice(order.amountKobo)}</p>
          </div>
          <div>
            <p className="text-ink-muted">Currency</p>
            <p className="text-body font-medium text-ink">{order.currency}</p>
          </div>
          <div>
            <p className="text-ink-muted">Transaction Reference</p>
            <p className="text-body font-mono text-ink">{order.txRef}</p>
          </div>
          <div>
            <p className="text-ink-muted">Gateway Reference</p>
            <p className="text-body font-mono text-ink">{order.payment?.gatewayReference || '—'}</p>
          </div>
          <div>
            <p className="text-ink-muted">Created</p>
            <p className="text-body text-ink">{format(new Date(order.createdAt), 'MMM d, yyyy • HH:mm')}</p>
          </div>
          <div>
            <p className="text-ink-muted">Last Updated</p>
            <p className="text-body text-ink">{format(new Date(order.updatedAt), 'MMM d, yyyy • HH:mm')}</p>
          </div>
          {order.payment?.paidAt && (
            <div>
              <p className="text-ink-muted">Paid At</p>
              <p className="text-body text-ink">{format(new Date(order.payment.paidAt), 'MMM d, yyyy • HH:mm')}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
