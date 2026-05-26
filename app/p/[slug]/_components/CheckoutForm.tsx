'use client';

import { useState, useRef } from 'react';
import { initiateCheckout } from '../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Loader2 } from 'lucide-react';

export function CheckoutForm({
  product,
}: {
  product: { id: string; name: string; priceKobo: number };
}) {
  const [state, setState] = useState<{ error?: string } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    const formData = new FormData(formRef.current);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;

    if (!email || !name) {
      setState({ error: 'Please fill in all fields.' });
      return;
    }

    setIsPending(true);
    setState(null);

    const result = await initiateCheckout(null, formData);

    if ('error' in result) {
      setState({ error: result.error });
      setIsPending(false);
      return;
    }

    if (!result.success) {
      setState({ error: 'Something went wrong. Please try again.' });
      setIsPending(false);
      return;
    }

    window.location.href = result.link;
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="md:static md:pb-0 pb-0">
      <input type="hidden" name="productId" value={product.id} />

      <div className="space-y-3">
        <Input
          label="Your Name"
          name="name"
          placeholder="e.g. Ebuka Obi-Uchendu"
          required
          disabled={isPending}
        />
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="buyer@example.com"
          required
          disabled={isPending}
        />
      </div>

      {state?.error && (
        <p className="mt-3 text-body-sm text-error bg-error/10 p-3 rounded-lg text-center">
          {state.error}
        </p>
      )}

      <div className="sticky bottom-0 bg-bg pt-4 pb-4 md:static md:pb-0 md:pt-4 md:mt-6 -mx-4 px-4 md:mx-0 md:px-0">
        <Button type="submit" className="w-full" size="lg" disabled={isPending}>
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Redirecting to payment...
            </span>
          ) : (
            'Pay Now'
          )}
        </Button>

        <p className="mt-3 text-body-sm text-ink-muted text-center leading-relaxed">
          You&apos;ll complete payment securely on Flutterwave.
        </p>
      </div>
    </form>
  );
}
