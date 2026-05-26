'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { checkOrderStatus } from '../actions';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';

const POLL_TIMEOUT_MS = 60_000;

export function PaymentVerification() {
  const searchParams = useSearchParams();
  const txRef = searchParams.get('txRef');
  const [status, setStatus] = useState<'pending' | 'paid' | 'not_found' | 'timeout'>('pending');
  const startTimeRef = useRef(0);

  useEffect(() => {
    if (!txRef) return;

    let cancelled = false;
    startTimeRef.current = Date.now();

    const poll = async () => {
      if (Date.now() - startTimeRef.current > POLL_TIMEOUT_MS) {
        if (!cancelled) setStatus('timeout');
        return;
      }

      const result = await checkOrderStatus(txRef);
      if (cancelled) return;

      if (result.status === 'paid') {
        setStatus('paid');
      } else if (result.status === 'not_found') {
        setStatus('not_found');
      } else {
        setTimeout(poll, 2000);
      }
    };

    poll();

    return () => { cancelled = true; };
  }, [txRef]);

  if (!txRef) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-error/10 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-error" />
            </div>
          </div>
          <h1 className="text-h1 font-bold text-ink">Invalid Request</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            No transaction reference found.
          </p>
          <Link href="/">
            <Button variant="primary" className="w-full">Return Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (status === 'pending') {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-brand/10 p-4 rounded-full">
              <Loader2 className="h-12 w-12 text-brand animate-spin" />
            </div>
          </div>
          <h1 className="text-h1 font-bold text-ink">Verifying your payment...</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            We&apos;re confirming your transaction. This should only take a few seconds.
          </p>
        </div>
      </main>
    );
  }

  if (status === 'timeout') {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-warning/10 p-4 rounded-full">
              <Loader2 className="h-12 w-12 text-warning" />
            </div>
          </div>
          <h1 className="text-h1 font-bold text-ink">Still confirming...</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            Your payment may have gone through but we&apos;re still waiting for confirmation. Please contact the seller with your transaction reference.
          </p>
          <Link href="/">
            <Button variant="primary" className="w-full">Return Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (status === 'not_found') {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-error/10 p-4 rounded-full">
              <XCircle className="h-12 w-12 text-error" />
            </div>
          </div>
          <h1 className="text-h1 font-bold text-ink">Payment Not Found</h1>
          <p className="text-body text-ink-muted leading-relaxed">
            We couldn&apos;t find a matching order. Please contact the seller.
          </p>
          <Link href="/">
            <Button variant="primary" className="w-full">Return Home</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4 py-12">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-brand/10 p-4 rounded-full">
            <CheckCircle2 className="h-12 w-12 text-brand" />
          </div>
        </div>
        <h1 className="text-h1 font-bold text-ink">Payment Successful!</h1>
        <p className="text-body text-ink-muted leading-relaxed">
          Your order has been confirmed. The seller has been notified.
        </p>
        <Link href="/">
          <Button variant="primary" className="w-full">Return Home</Button>
        </Link>
      </div>
    </main>
  );
}
