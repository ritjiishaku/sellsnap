'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getDashboardStats } from '@/app/dashboard/actions';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Plus,
  Package,
  ListOrdered,
  AlertCircle,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  RefreshCw,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice } from '@/lib/format';

type OrderRow = {
  id: string;
  status: string;
  amountKobo: number;
  txRef: string;
  buyerName: string | null;
  updatedAt: string;
  product: { name: string };
};

type ProductRow = {
  id: string;
  name: string;
  priceKobo: number;
  slug: string;
  imageUrl: string | null;
};

type DashboardData = {
  name: string | null;
  businessName: string | null;
  productCount: number;
  paidOrderCount: number;
  revenueKobo: number;
  todayOrderCount: number;
  todayRevenueKobo: number;
  thisWeekRevenue: number;
  revenueChange: number;
  statusBreakdown: { paid: number; pending: number; failed: number };
  lastProductAt: string | null;
  lastOrderAt: string | null;
  lastFailedAt: string | null;
  pendingCount: number;
  recentOrders: OrderRow[];
  recentProducts: ProductRow[];
  appUrl: string;
};

const STATUS_LABELS: Record<string, string> = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
};

const STATUS_BADGES: Record<string, string> = {
  paid: 'bg-success/15 text-success',
  pending: 'bg-warning/15 text-warning',
  failed: 'bg-error/15 text-error',
};

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-success',
  pending: 'bg-warning',
  failed: 'bg-error/30',
};

const RENDER_NOW = Date.now();
const RENDER_HOUR = new Date(RENDER_NOW).getHours();

export function DashboardOverview({ initialData }: { initialData?: DashboardData | null }) {
  const [data, setData] = useState<DashboardData | null>(initialData || null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(!initialData);
  const fetchStats = useCallback(() => {
    setLoading(true);
    setError(false);
    getDashboardStats()
      .then((r) => setData(r as DashboardData))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;
    getDashboardStats()
      .then((r) => { if (!cancelled) setData(r as DashboardData); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-error" />
        <div className="space-y-1">
          <p className="text-h2 font-bold text-ink">Failed to load dashboard</p>
          <p className="text-body text-ink-muted">Check your connection and try again.</p>
        </div>
        <Button variant="primary" onClick={fetchStats}>
          Retry
        </Button>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="space-y-5">
        <div className="flex justify-between">
          <div className="h-7 w-52 bg-surface rounded-sm animate-pulse" />
          <div className="h-7 w-7 bg-surface rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-surface rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div className="h-24 bg-surface rounded-2xl animate-pulse" />
          <div className="h-24 bg-surface rounded-2xl animate-pulse" />
        </div>
        <div className="h-6 w-44 bg-surface rounded-sm animate-pulse" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 bg-surface rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const hasProducts = data.productCount > 0;
  const hasOrders = data.paidOrderCount > 0 || data.pendingCount > 0;

  const totalOrders = data.statusBreakdown.paid + data.statusBreakdown.pending + data.statusBreakdown.failed;
  const paidPct = totalOrders > 0 ? (data.statusBreakdown.paid / totalOrders) * 100 : 0;
  const pendingPct = totalOrders > 0 ? (data.statusBreakdown.pending / totalOrders) * 100 : 0;
  const failedPct = totalOrders > 0 ? (data.statusBreakdown.failed / totalOrders) * 100 : 0;

  const greetingName = data.name
    ? data.name.split(' ')[0]
    : data.businessName
      ? data.businessName
      : 'there';

  const timeGreeting = RENDER_HOUR < 12 ? 'Good morning' : RENDER_HOUR < 17 ? 'Good afternoon' : 'Good evening';

  const twentyFourHoursAgo = new Date(RENDER_NOW - 24 * 60 * 60 * 1000);
  const recentFailed = data.lastFailedAt && new Date(data.lastFailedAt) > twentyFourHoursAgo;

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-h1 font-bold text-ink">{timeGreeting}, {greetingName}</h1>
          <p className="text-body text-ink-muted mt-1">
            {data.businessName ? `${data.businessName} · ` : ''}
            {hasProducts ? 'your store at a glance' : 'create your first product to get started'}
          </p>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          className="p-2 rounded-full hover:bg-surface text-ink-muted hover:text-ink transition-colors shrink-0 cursor-pointer disabled:opacity-50"
          aria-label="Refresh dashboard"
        >
          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Today badge */}
      {data.todayOrderCount > 0 && (
        <div className="flex items-center gap-2 bg-success/10 text-success rounded-full px-4 py-2 text-label-sm font-semibold w-fit">
          <TrendingUp className="h-4 w-4" />
          <span>{data.todayOrderCount} sale{data.todayOrderCount > 1 ? 's' : ''} today</span>
          {data.todayRevenueKobo > 0 && (
            <span className="text-success/70">· {formatPrice(data.todayRevenueKobo)}</span>
          )}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <StatLink href="/dashboard?tab=products" label="Products Listed" value={data.productCount.toLocaleString()} icon={<Package className="h-4 w-4 text-brand" />} />
        <StatLink href="/dashboard?tab=orders" label="Paid Orders" value={data.paidOrderCount.toLocaleString()} icon={<ListOrdered className="h-4 w-4 text-brand" />} />
        <StatLink href="/dashboard?tab=orders" label="Revenue" value={formatPrice(data.revenueKobo)} icon={<span className="text-title-lg font-bold text-brand">₦</span>} />
      </div>

      {/* Revenue trend + Order breakdown — side by side on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Revenue this week */}
        <div className="rounded-2xl border border-border bg-surface p-4 md:p-5 space-y-1.5">
          <p className="text-label-sm text-ink-muted">This Week&apos;s Sales</p>
          <p className="text-title-lg font-bold text-ink">
            {formatPrice(data.thisWeekRevenue)}
          </p>
          {data.thisWeekRevenue > 0 || data.revenueChange > 0 ? (
            <p className={`text-label-sm font-semibold flex items-center gap-1 ${data.revenueChange >= 0 ? 'text-success' : 'text-error'}`}>
              {data.revenueChange >= 0 ? '▲' : '▼'} {Math.abs(data.revenueChange)}% vs last week
            </p>
          ) : hasProducts ? (
            <p className="text-label-sm text-ink-muted">Share your product link to make your first sale</p>
          ) : (
            <p className="text-label-sm text-ink-muted">Add a product to start selling</p>
          )}
        </div>

        {/* Order status breakdown */}
        <div className="rounded-2xl border border-border bg-surface p-4 md:p-5 space-y-2.5">
          <p className="text-label-sm text-ink-muted">Order Breakdown</p>
          {totalOrders > 0 ? (
            <>
              <div className="flex h-2 rounded-full overflow-hidden bg-border">
                {paidPct > 0 && <div className={STATUS_COLORS.paid} style={{ width: `${paidPct}%` }} />}
                {pendingPct > 0 && <div className={STATUS_COLORS.pending} style={{ width: `${pendingPct}%` }} />}
                {failedPct > 0 && <div className={STATUS_COLORS.failed} style={{ width: `${failedPct}%` }} />}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-label-sm text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-success" /> Paid ({data.statusBreakdown.paid})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-warning" /> Pending ({data.statusBreakdown.pending})
                </span>
                {data.statusBreakdown.failed > 0 && (
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-error/30" /> Failed ({data.statusBreakdown.failed})
                  </span>
                )}
              </div>
            </>
          ) : (
            <p className="text-body-sm text-ink-muted">No orders yet — share your link to get started</p>
          )}
        </div>
      </div>

      {/* Last activity */}
      {(data.lastProductAt || data.lastOrderAt) && (
        <div className="flex flex-wrap gap-3">
          {data.lastProductAt && (
            <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 text-label-sm text-ink-muted">
              <Package className="h-4 w-4 text-ink-subtle" />
              Last product added {formatDistanceToNow(new Date(data.lastProductAt), { addSuffix: true })}
            </div>
          )}
          {data.lastOrderAt && (
            <div className="flex items-center gap-2 bg-surface border border-border rounded-full px-4 py-2 text-label-sm text-ink-muted">
              <Clock className="h-4 w-4 text-ink-subtle" />
              Last order {formatDistanceToNow(new Date(data.lastOrderAt), { addSuffix: true })}
            </div>
          )}
        </div>
      )}

      {/* Pending alert */}
      {data.pendingCount > 0 && (
        <div className="flex items-center gap-3 bg-warning/10 border border-warning/30 rounded-xl px-4 py-3">
          <AlertCircle className="h-5 w-5 text-warning shrink-0" />
          <p className="text-body-sm font-medium text-warning flex-1">
            {data.pendingCount} pending payment{data.pendingCount > 1 ? 's' : ''} — check if your customer has paid
          </p>
          <Link
            href="/dashboard?tab=orders&status=pending"
            className="text-body-sm font-semibold text-warning underline shrink-0 hover:no-underline"
          >
            View
          </Link>
        </div>
      )}

      {/* Recent failed alert */}
      {recentFailed && data.statusBreakdown.failed > 0 && (
        <div className="flex items-center gap-3 bg-error/10 border border-error/30 rounded-xl px-4 py-3">
          <AlertTriangle className="h-5 w-5 text-error shrink-0" />
          <p className="text-body-sm font-medium text-error flex-1">
            {data.statusBreakdown.failed} failed payment{data.statusBreakdown.failed > 1 ? 's' : ''} — check what went wrong
          </p>
          <Link
            href="/dashboard?tab=orders&status=failed"
            className="text-body-sm font-semibold text-error underline shrink-0 hover:no-underline"
          >
            Review
          </Link>
        </div>
      )}

      {/* Recent Orders */}
      <div className="space-y-4">
        <h2 className="text-h2 font-bold text-ink">Recent Orders</h2>

        {!hasOrders ? (
          <Card className="flex flex-col items-center justify-center py-10 text-center space-y-3 border-dashed border-2">
            <ListOrdered className="h-8 w-8 text-ink-muted opacity-50" />
            <div className="space-y-1">
              <p className="text-body font-semibold text-ink">No orders yet</p>
              <p className="text-body-sm text-ink-muted max-w-[260px] mx-auto">
                Share your product links on WhatsApp or Instagram. That&apos;s where your buyers are.
              </p>
            </div>
          </Card>
        ) : data.recentOrders.length === 0 ? (
          <p className="text-body-sm text-ink-muted text-center py-8">
            No orders match the current filter.
          </p>
        ) : (
          <div className="space-y-2">
            {data.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between gap-3 bg-surface border border-border rounded-xl px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-body-sm font-semibold text-ink truncate">{order.product.name}</p>
                  <p className="text-label-sm text-ink-muted">
                    {order.buyerName ?? 'Anonymous'} · {formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-body-sm font-bold text-brand">
                    {formatPrice(order.amountKobo)}
                  </span>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-label-sm font-semibold ${STATUS_BADGES[order.status] || ''}`}>
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-h2 font-bold text-ink">Quick Actions</h2>
        {hasProducts ? (
          <div className="grid grid-cols-2 gap-4">
            <ActionCard
              href="/dashboard?tab=products"
              icon={<Plus className="h-5 w-5 text-brand" />}
              label="Add Product"
              desc="Upload a product, get a shareable link"
            />
            <ActionCard
              href={`https://wa.me/?text=${encodeURIComponent(`Hi! I sell on SellSnap. Check out my products here: ${data.appUrl}/dashboard?tab=products`)}`}
              rel="noopener noreferrer"
              target="_blank"
              icon={<ExternalLink className="h-5 w-5 text-brand" />}
              label="Share Your Store"
              desc="Let buyers know what you&apos;re selling"
            />
          </div>
        ) : (
          <div className="flex justify-center">
            <ActionCard
              href="/dashboard?tab=products"
              icon={<Plus className="h-5 w-5 text-brand" />}
              label="Add Your First Product"
              desc="Takes less than a minute"
            />
          </div>
        )}
      </div>

      {/* Recent Products */}
      {data.recentProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-h2 font-bold text-ink">Recent Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.recentProducts.map((product) => (
              <Link
                key={product.id}
                href="/dashboard?tab=products"
                className="bg-surface border border-border rounded-xl overflow-hidden hover:border-brand transition-colors group"
              >
                {product.imageUrl ? (
                  <div className="h-20 overflow-hidden relative">
                    <Image src={product.imageUrl} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 25vw" />
                  </div>
                ) : (
                  <div className="h-20 bg-surface-variant flex items-center justify-center">
                    <Package className="h-6 w-6 text-ink-subtle" />
                  </div>
                )}
                <div className="p-2.5 space-y-0.5">
                  <p className="text-label-sm font-semibold text-ink truncate">{product.name}</p>
                  <p className="text-label-sm font-bold text-brand">{formatPrice(product.priceKobo)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatLink({ href, label, value, icon }: { href: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-2xl border border-border bg-surface p-4 md:p-5 space-y-2 hover:border-brand hover:bg-brand/5 transition-colors block"
    >
      <div className="flex items-center justify-between">
        <p className="text-label-sm text-ink-muted">{label}</p>
        {icon}
      </div>
      <p className="text-title-lg font-bold text-ink">{value}</p>
    </Link>
  );
}

function ActionCard({ href, icon, label, desc, ...linkProps }: { href: string; icon: React.ReactNode; label: string; desc: string; rel?: string; target?: string }) {
  return (
    <Link
      href={href}
      {...linkProps}
      className="flex flex-col items-center justify-center gap-2 bg-surface border border-border rounded-2xl p-3 md:p-4 hover:border-brand hover:bg-brand/5 transition-colors text-center"
    >
      <div className="bg-brand/10 p-2.5 rounded-full">{icon}</div>
      <span className="text-label-sm font-semibold text-ink">{label}</span>
      <span className="text-label-sm text-ink-muted leading-snug">{desc}</span>
    </Link>
  );
}
