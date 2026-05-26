'use client';

import { Input } from './Input';
import { Upload, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export function ProductFormFields({
  fileRef,
  preview,
  isPending,
  onPreviewChange,
  defaultName,
  defaultDescription,
  defaultPrice,
}: {
  fileRef: React.RefObject<HTMLInputElement | null>;
  preview: string | null;
  isPending: boolean;
  onPreviewChange: (preview: string | null) => void;
  defaultName?: string;
  defaultDescription?: string;
  defaultPrice?: string;
}) {
  return (
    <>
      <Input
        label="Product Name"
        name="name"
        defaultValue={defaultName}
        placeholder="e.g. Vintage Shirt"
        required
        disabled={isPending}
      />
      <Input
        label="Description (Optional)"
        name="description"
        defaultValue={defaultDescription}
        placeholder="Tell your buyers more about the product"
        disabled={isPending}
      />
      <Input
        label="Price (NGN)"
        name="price"
        type="number"
        step="0.01"
        defaultValue={defaultPrice}
        placeholder="0.00"
        required
        disabled={isPending}
      />

      <div className="space-y-1.5">
        <label className="text-body-sm font-medium text-ink-muted">Product Image</label>
        <div
          onClick={() => fileRef.current?.click()}
          className={cn(
            'relative flex items-center justify-center border-2 border-dashed border-border rounded-sm cursor-pointer hover:border-brand transition-colors h-32',
            preview && 'border-brand'
          )}
        >
          {preview ? (
            <>
              <img src={preview} alt="Preview" className="h-full w-full object-cover rounded-sm" />
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onPreviewChange(null); if (fileRef.current) fileRef.current.value = ''; }}
                className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-ink-muted">
              <Upload className="h-6 w-6" />
              <span className="text-body-sm">Upload image</span>
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
            if (file) onPreviewChange(URL.createObjectURL(file));
          }}
        />
      </div>
    </>
  );
}
