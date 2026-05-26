'use client';

import { useState, useActionState, useRef } from 'react';
import { createProduct } from '@/app/dashboard/products/actions';
import { Button } from '@/components/ui/Button';
import { ProductFormFields } from '@/components/ui/ProductFormFields';

export function OnboardingProductForm({ onProductCreated }: { onProductCreated?: (slug: string) => void }) {
  const [state, action, isPending] = useActionState(createProduct, null);
  const [preview, setPreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleContinue = () => {
    if (state?.slug) {
      onProductCreated?.(state.slug);
    }
  };

  if (state?.success && state.slug) {
    const productLink = `${window.location.origin}/p/${state.slug}`;
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 bg-success/10 rounded-lg px-4 py-3">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="shrink-0">
            <circle cx="10" cy="10" r="10" className="fill-brand" />
            <path d="M6 10l3 3 5-5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="text-body-sm font-semibold text-ink">Your product is live. Share your payment link.</p>
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
        <Button onClick={handleContinue} className="w-full" size="lg">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-3">
      <ProductFormFields fileRef={fileRef} preview={preview} isPending={isPending} onPreviewChange={setPreview} />

      {state?.error && (
        <p className="text-body-sm text-error bg-error/10 p-3 rounded-lg">
          {state.error}
        </p>
      )}

      <Button type="submit" className="w-full" size="lg" disabled={isPending}>
        {isPending ? 'Creating...' : 'Create Product & Go to Dashboard'}
      </Button>
    </form>
  );
}
