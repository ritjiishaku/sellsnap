'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Copy, Check, ExternalLink } from 'lucide-react';

export function OrderActions({ paymentLink }: { paymentLink: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <div className="flex gap-2">
      <Button
        variant="surface"
        size="sm"
        className="gap-2"
        onClick={() => { navigator.clipboard.writeText(paymentLink); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      >
        {copied ? <Check className="h-4 w-4 text-brand" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy Link'}
      </Button>
      <Button
        variant="surface"
        size="sm"
        className="gap-2"
        onClick={() => window.open(paymentLink, '_blank', 'noopener,noreferrer')}
      >
        <ExternalLink className="h-4 w-4" />
        View Product
      </Button>
    </div>
  );
}
