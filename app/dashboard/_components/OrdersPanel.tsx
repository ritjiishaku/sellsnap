'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { getOrders } from '@/app/dashboard/actions';
import { ListOrdered } from 'lucide-react';
import { format } from 'date-fns';
import { formatPrice } from '@/lib/format';

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

type OrderRow = {
  id: string;
  status: string;
  amountKobo: number;
  txRef: string;
  buyerName: string | null;
  buyerEmail: string;
  updatedAt: string;
  product: { name: string };
};

type OrdersData = {
  orders: OrderRow[];
  countMap: Record<string, number>;
};

export function OrdersPanel({ initialData }: { initialData?: OrdersData | null }) {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('all');
  const [data, setData] = useState<OrdersData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    getOrders(activeFilter)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData({
            orders: result.orders as OrderRow[],
            countMap: result.countMap,
          });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [activeFilter, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-bold text-ink">Orders</h1>
          <p className="text-body text-ink-muted">Track your sales and payments.</p>
        </div>
        <Card className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-dashed border-2">
          <p className="text-body text-error">Failed to load orders.</p>
          <button onClick={refresh} className="text-brand underline text-body-sm cursor-pointer">
            Try again
          </button>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-7 w-20 bg-surface rounded-sm animate-pulse" />
          <div className="h-4 w-44 bg-surface rounded-sm animate-pulse mt-2" />
        </div>
        <div className="flex gap-1 border-b border-border">
          {['All', 'Paid', 'Pending', 'Failed'].map((s) => (
            <div key={s} className="h-9 w-16 bg-surface rounded-sm animate-pulse" />
          ))}
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const orders = data?.orders ?? [];
  const countMap = data?.countMap ?? { all: 0 };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-ink">Orders</h1>
        <p className="text-body text-ink-muted">Track your sales and payments.</p>
      </div>

      <div className="flex gap-1 border-b border-border overflow-x-auto">
        {['all', 'paid', 'pending', 'failed'].map((s) => (
          <button
            key={s}
            onClick={() => setActiveFilter(s)}
            className={`whitespace-nowrap px-4 py-2.5 text-label-md font-semibold border-b-2 transition-colors cursor-pointer ${
              activeFilter === s
                ? 'border-brand text-brand'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {s === 'all' ? 'All' : STATUS_LABELS[s] || s}
            <span className="ml-1.5 text-body-sm opacity-60">
              ({countMap[s] || 0})
            </span>
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-dashed border-2">
          <div className="bg-surface p-6 rounded-full">
            <ListOrdered className="h-10 w-10 text-ink-muted opacity-50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-h2 font-semibold text-ink">No orders yet</h3>
            <p className="text-body text-ink-muted max-w-xs mx-auto">
              Share your product links on WhatsApp or Instagram to start receiving payments.
            </p>
          </div>
        </Card>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {orders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block">
              <Card className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <p className="text-body font-semibold text-ink">{order.product.name}</p>
                    <p className="text-body-sm text-ink-muted font-mono">Ref: {order.txRef}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0 ml-2">
                    <span className="text-body font-black text-brand">
                      {formatPrice(order.amountKobo)}
                    </span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-label-sm font-semibold ${STATUS_COLORS[order.status] || ''}`}
                    >
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="space-y-0.5">
                    <p className="text-body-sm font-medium text-ink">{order.buyerName ?? 'Anonymous'}</p>
                    <p className="text-body-sm text-ink-muted">{order.buyerEmail}</p>
                  </div>
                  <span className="text-label-sm text-ink-muted">
                    {format(new Date(order.updatedAt), 'MMM d, yyyy')}
                  </span>
                </div>
              </Card>
              </Link>
            ))}
          </div>

          <Card className="hidden md:block overflow-x-auto p-0 border-0 shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-surface border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-body-sm font-bold text-ink-muted">Product</th>
                  <th className="px-6 py-4 text-body-sm font-bold text-ink-muted">Customer</th>
                  <th className="px-6 py-4 text-body-sm font-bold text-ink-muted">Amount</th>
                  <th className="px-6 py-4 text-body-sm font-bold text-ink-muted">Status</th>
                  <th className="px-6 py-4 text-body-sm font-bold text-ink-muted">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-surface transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)} tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/dashboard/orders/${order.id}`); }}>
                    <td className="px-6 py-4">
                      <p className="text-body font-semibold text-ink">{order.product.name}</p>
                      <p className="text-body-sm text-ink-muted font-mono">Ref: {order.txRef}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-body font-medium text-ink">{order.buyerName ?? 'Anonymous'}</p>
                      <p className="text-body-sm text-ink-muted">{order.buyerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-body font-black text-brand">
                      {formatPrice(order.amountKobo)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-label-sm font-semibold ${STATUS_COLORS[order.status] || ''}`}
                      >
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-sm text-ink-muted">
                      {format(new Date(order.updatedAt), 'MMM d, yyyy • HH:mm')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
