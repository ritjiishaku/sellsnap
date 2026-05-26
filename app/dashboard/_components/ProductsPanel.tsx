'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { ProductCard } from '@/app/dashboard/products/_components/ProductCard';
import { CreateProductForm } from '@/app/dashboard/products/_components/CreateProductForm';
import { getProducts } from '@/app/dashboard/actions';
import { Search } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  priceKobo: number;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export function ProductsPanel({ initialData }: { initialData?: { products: Product[]; businessName: string | null } | null }) {
  const [data, setData] = useState<{ products: Product[]; businessName: string | null } | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'newest' | 'name' | 'price-low' | 'price-high'>('newest');

  useEffect(() => {
    if (initialData && refreshKey === 0) return;
    let cancelled = false;

    getProducts()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [refreshKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  const products = data?.products ?? [];
  const businessName = data?.businessName ?? null;

  const isNewUser = !data || products.length === 0;

  const filteredProducts = useMemo(() => {
    let result = products;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q))
      );
    }

    switch (sort) {
      case 'name':
        result = [...result].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-low':
        result = [...result].sort((a, b) => a.priceKobo - b.priceKobo);
        break;
      case 'price-high':
        result = [...result].sort((a, b) => b.priceKobo - a.priceKobo);
        break;
      default:
        result = [...result];
        break;
    }

    return result;
  }, [products, search, sort]);

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-ink">Products</h1>
            <p className="text-body text-ink-muted">Manage your products and share payment links.</p>
          </div>
        </div>
        <Card className="flex flex-col items-center justify-center py-20 text-center space-y-4 border-dashed border-2">
          <p className="text-body text-error">Failed to load products.</p>
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="h-7 w-32 bg-surface rounded-sm animate-pulse" />
            <div className="h-4 w-56 bg-surface rounded-sm animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="h-48 bg-surface-variant animate-pulse" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-surface-variant rounded-sm animate-pulse" />
                <div className="h-4 w-1/2 bg-surface-variant rounded-sm animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-ink">Products</h1>
          <p className="text-body text-ink-muted">
            {isNewUser
              ? 'Create your first product and get a shareable payment link in seconds.'
              : 'Manage your products and share payment links.'}
          </p>
        </div>
        {!isNewUser && <CreateProductForm onSuccess={refresh} />}
      </div>

      {isNewUser ? (
        <CreateProductForm onSuccess={refresh} inline />
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-muted pointer-events-none" />
              <input
                type="text"
                aria-label="Search products"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-sm border-2 border-border bg-transparent text-body-sm text-ink placeholder:text-ink-subtle focus-visible:outline-none focus-visible:border-brand transition-colors"
              />
            </div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as typeof sort)}
              className="h-11 px-4 rounded-sm border-2 border-border bg-transparent text-body-sm text-ink focus-visible:outline-none focus-visible:border-brand transition-colors"
            >
              <option value="newest">Newest</option>
              <option value="name">Name A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {filteredProducts.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-16 text-center space-y-3 border-dashed border-2">
              <Search className="h-8 w-8 text-ink-muted opacity-50" />
              <div className="space-y-1">
                <p className="text-body font-semibold text-ink">No products match &quot;{search}&quot;</p>
                <button onClick={() => setSearch('')} className="text-body-sm text-brand underline cursor-pointer">
                  Clear search
                </button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} businessName={businessName} onDelete={refresh} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
