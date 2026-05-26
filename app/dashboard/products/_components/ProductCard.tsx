'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { Copy, Check, Share2, ExternalLink, Package, Pencil, Trash2 } from 'lucide-react';
import { env } from '@/lib/env';
import { formatPrice } from '@/lib/format';
import { deleteProduct } from '../actions';
import { EditProductModal } from './EditProductModal';

type Product = {
  id: string;
  name: string;
  priceKobo: number;
  slug: string;
  description: string | null;
  imageUrl: string | null;
};

export function ProductCard({ product, businessName, onDelete }: { product: Product; businessName?: string | null; onDelete?: () => void }) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const paymentLink = `${env.NEXT_PUBLIC_APP_URL}/p/${product.slug}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(paymentLink);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = paymentLink;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = () => {
    const seller = businessName ? `${businessName} — ` : '';
    const price = formatPrice(product.priceKobo);
    const text = `${seller}${product.name} — ${price}\n\nBuy here: ${paymentLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async () => {
    const form = new FormData();
    form.set('id', product.id);
    const result = await deleteProduct(form);
    setDeleting(false);
    if ('error' in result) {
      alert(result.error);
      return;
    }
    onDelete?.();
  };

  return (
    <>
      <Card className="flex flex-col h-full space-y-4 group overflow-hidden">
        {product.imageUrl ? (
          <div className="h-48 -mx-4 -mt-4 overflow-hidden rounded-t-xl relative">
            <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
          </div>
        ) : (
          <div className="h-48 -mx-4 -mt-4 overflow-hidden rounded-t-xl bg-surface-variant flex items-center justify-center">
            <Package className="h-12 w-12 text-ink-subtle" />
          </div>
        )}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="text-h2 font-bold text-ink line-clamp-1">{product.name}</h3>
            <span className="text-body font-bold text-brand shrink-0 ml-2">
              {formatPrice(product.priceKobo)}
            </span>
          </div>
          <p className="text-body-sm text-ink-muted line-clamp-2">
            {product.description || 'No description provided.'}
          </p>
        </div>

        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 gap-2 rounded-xl"
              onClick={copyToClipboard}
            >
              {copied ? (
                <Check className="h-4 w-4 text-brand" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              className="flex-1 gap-2 rounded-xl"
              onClick={shareOnWhatsApp}
            >
              <Share2 className="h-4 w-4" />
              WhatsApp
            </Button>
          </div>
          
          <Button 
            variant="secondary" 
            size="sm" 
            className="w-full gap-2 rounded-xl"
            onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}
          >
            <ExternalLink className="h-4 w-4" />
            View Page
          </Button>

          <div className="flex gap-2 pt-1">
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5 text-ink-muted"
              onClick={() => setEditing(true)}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5 text-error"
              onClick={() => setDeleting(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Card>

      {editing && (
        <EditProductModal product={product} onClose={() => setEditing(false)} onSuccess={onDelete} />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-sm relative animate-in slide-in-from-bottom-4 duration-300 bg-surface border-border text-center space-y-4">
            <Trash2 className="h-10 w-10 text-error mx-auto" />
            <div className="space-y-1">
              <h3 className="text-h2 font-bold text-ink">Delete &quot;{product.name}&quot;?</h3>
              <p className="text-body-sm text-ink-muted">This action cannot be undone. The product link will stop working.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setDeleting(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
