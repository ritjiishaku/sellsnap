'use client';

import { useState, useActionState, useEffect, useRef } from 'react';
import { updateProduct } from '../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { X, Upload } from 'lucide-react';
import { cn } from '@/lib/cn';

type Product = {
  id: string;
  name: string;
  priceKobo: number;
  description: string | null;
  imageUrl: string | null;
};

export function EditProductModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [state, action, isPending] = useActionState(updateProduct, null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.success) {
      onClose();
      onSuccess?.();
    }
  }, [state, onClose, onSuccess]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg relative animate-in slide-in-from-bottom-4 duration-300 bg-surface border-border">
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-ink-muted hover:text-ink transition-colors cursor-pointer"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-h1 font-bold text-ink">Edit Product</h2>
            <p className="text-body text-ink-muted">Update the details for this product.</p>
          </div>

          <form action={action} className="space-y-4">
            <input type="hidden" name="id" value={product.id} />

            <Input
              label="Product Name"
              name="name"
              defaultValue={product.name}
              placeholder="e.g. Vintage Shirt"
              required
              disabled={isPending}
            />
            <Input
              label="Description (Optional)"
              name="description"
              defaultValue={product.description || ''}
              placeholder="Tell your buyers more about the product"
              disabled={isPending}
            />

            <div className="space-y-1.5">
              <label className="text-body-sm font-medium text-ink-muted">Product Image</label>
              <div
                onClick={() => fileRef.current?.click()}
                className={cn(
                  'relative flex items-center justify-center border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-brand transition-colors h-40',
                  (preview || product.imageUrl) && 'border-brand'
                )}
              >
                {preview || product.imageUrl ? (
                  <>
                    <img src={preview || product.imageUrl!} alt="" className="h-full w-full object-cover rounded-sm" />
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setPreview(null); if (fileRef.current) fileRef.current.value = ''; }}
                      className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-ink-muted">
                    <Upload className="h-8 w-8" />
                    <span className="text-body-sm">Click to upload image</span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                name="image"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </div>

            <Input
              label="Price (NGN)"
              name="price"
              type="number"
              step="0.01"
              defaultValue={String(product.priceKobo / 100)}
              placeholder="0.00"
              required
              disabled={isPending}
            />

            {state?.error && (
              <p className="text-body-sm text-error bg-error/10 p-3 rounded-lg">
                {state.error}
              </p>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
