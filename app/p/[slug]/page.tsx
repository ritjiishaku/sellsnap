import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Zap } from 'lucide-react';
import { CheckoutForm } from './_components/CheckoutForm';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await db.product.findUnique({ where: { slug } });
  if (!product) return { title: 'Product Not Found' };

  return {
    title: `Buy ${product.name} | SellSnap`,
    description: product.description || `Purchase ${product.name} securely via SellSnap.`,
  };
}

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await db.product.findUnique({
    where: { slug },
    include: { user: true },
  });

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-bg flex flex-col md:flex-row">
      {/* Product Image — left half on desktop */}
      {product.imageUrl && (
        <div className="md:w-1/2 md:h-screen md:sticky md:top-0 overflow-hidden -mx-4 md:mx-0 relative aspect-square md:aspect-auto">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" priority />
        </div>
      )}

      {/* Content — right half on desktop */}
      <div className="flex-1 flex flex-col px-4 md:px-10 md:w-1/2 md:overflow-y-auto md:h-screen">
        <div className="flex flex-col justify-center max-w-lg mx-auto w-full py-4 md:py-10">
          {/* Seller name */}
          <div className="pb-2">
            <p className="text-body-sm text-ink-muted">{product.user.name}</p>
          </div>

          {/* Product name & price */}
          <div className="space-y-1.5">
            <h1 className="text-display font-bold text-ink leading-tight">{product.name}</h1>
            <p className="text-h1 font-black text-brand">₦{(product.priceKobo / 100).toLocaleString('en-NG')}</p>
          </div>

          {/* Trust signals */}
          <div className="flex justify-center gap-6 md:gap-8 py-4 md:py-6">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand" />
              <span className="text-body-sm text-ink-muted">Secured by Flutterwave</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-brand" />
              <span className="text-body-sm text-ink-muted">Instant confirmation</span>
            </div>
          </div>
        </div>

        {/* Checkout Form — sticky Pay Now on mobile */}
        <div className="md:pt-0 pb-6 md:pb-10">
          <CheckoutForm product={product} />
        </div>

        {/* Description — below the fold, reached by scrolling */}
        {product.description && (
          <div className="pb-6 md:pb-10">
            <div className="border-t border-border pt-6">
              <h2 className="text-body-sm font-semibold text-ink-muted uppercase tracking-wider mb-3">Description</h2>
              <p className="text-body text-ink leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
