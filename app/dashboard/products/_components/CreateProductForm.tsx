'use client';

import { useState, useActionState, useEffect, useRef, startTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct } from '../actions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProductFormFields } from '@/components/ui/ProductFormFields';
import { Plus, X } from 'lucide-react';

export function CreateProductForm({ onSuccess, inline, hideCancel }: { onSuccess?: () => void; inline?: boolean; hideCancel?: boolean }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [state, action, isPending] = useActionState(createProduct, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const prevSuccessRef = useRef(false);

  useEffect(() => {
    if (state?.success && !prevSuccessRef.current) {
      prevSuccessRef.current = true;
      setPreview(null);
      if (fileRef.current) fileRef.current.value = '';
      if (!inline) {
        startTransition(() => {
          setIsOpen(false);
          onSuccess?.();
        });
      }
    } else if (!state?.success) {
      prevSuccessRef.current = false;
    }
  }, [state, inline, onSuccess]);

  const handleClose = () => {
    setIsOpen(false);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const formContent = (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-4">
          <ProductFormFields fileRef={fileRef} preview={preview} isPending={isPending} onPreviewChange={setPreview} />
        </div>
      </div>

      {state?.error && (
        <p className="text-body-sm text-error bg-error/10 p-3 rounded-lg">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? 'Creating...' : 'Add Product'}
      </Button>
    </form>
  );

  if (inline) {
    if (state?.success) {
      const productLink = `${window.location.origin}/p/${state.slug}`;
      return (
        <Card className="border-brand/30 bg-brand/5 p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-brand/10 p-2 rounded-full">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="10" className="fill-brand" />
                <path d="M6 10l3 3 5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="text-body font-semibold text-ink">Product created!</p>
              <p className="text-body-sm text-ink-muted">Share your payment link to start selling.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2.5">
            <span className="flex-1 text-body-sm text-ink-muted truncate">{productLink}</span>
            <button
              onClick={() => { navigator.clipboard.writeText(productLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
              className="shrink-0 text-body-sm font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => onSuccess?.()} className="flex-1">
              Done
            </Button>
            <Button variant="surface" className="flex-1" onClick={() => { window.open(productLink, '_blank', 'noopener,noreferrer'); onSuccess?.(); }}>
              View Product
            </Button>
          </div>
        </Card>
      );
    }

    return (
      <form action={action} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-4">
            <ProductFormFields fileRef={fileRef} preview={preview} isPending={isPending} onPreviewChange={setPreview} />
          </div>
        </div>

        {state?.error && (
          <p className="text-body-sm text-error bg-error/10 p-3 rounded-lg">
            {state.error}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button type="submit" className="w-full sm:w-auto" size="lg" disabled={isPending}>
            {isPending ? 'Creating...' : 'Add Product'}
          </Button>
          {!hideCancel && (
            <Button type="button" variant="surface" size="lg" className="w-full sm:w-auto" onClick={() => router.push('/dashboard')} disabled={isPending}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    );
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="h-5 w-5" /> Add Product
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg p-6 md:p-8 relative animate-in slide-in-from-bottom-4 duration-300 bg-surface border-border">
            <button
              onClick={handleClose}
              className="absolute right-4 top-4 p-2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="space-y-2 mb-6">
              <h2 className="text-h2 font-bold text-ink">Add Product</h2>
              <p className="text-body-sm text-ink-muted">Fill in the details to generate a payment link.</p>
            </div>
            {formContent}
          </Card>
        </div>
      )}
    </>
  );
}
