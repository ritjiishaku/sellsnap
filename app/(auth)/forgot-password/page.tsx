'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Mail } from 'lucide-react';
import { requestPasswordReset } from '../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsPending(true);
    setError(null);

    const formData = new FormData(formRef.current);
    const result = await requestPasswordReset(null, formData);

    if ('error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    setSent(true);
    setIsPending(false);
  };

  if (sent) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-6 py-12 md:py-16 bg-surface-variant/20">
        <div className="w-full max-w-md space-y-6 text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="SellSnap" width={108} height={36} priority />
          </Link>
          <div className="bg-brand/10 p-4 rounded-full w-fit mx-auto">
            <Mail className="h-8 w-8 text-brand" />
          </div>
          <div className="space-y-2">
            <h1 className="text-h1 font-bold text-ink">Check your email</h1>
            <p className="text-body text-ink-muted leading-relaxed">
              If an account exists for <strong className="text-ink">{email}</strong>, we&apos;ve sent a password reset link.
            </p>
          </div>
          <Link href="/auth">
            <Button variant="secondary" className="w-full">
              Back to Login
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-6 py-12 md:py-16 bg-surface-variant/20">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="SellSnap" width={108} height={36} priority />
          </Link>
        </div>

        <div className="space-y-2 text-center">
          <h1 className="text-h1 font-bold text-ink">Forgot password?</h1>
          <p className="text-body text-ink-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            label="Email Address"
            name="email"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            required
            disabled={isPending}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {error && (
            <p className="text-body-sm text-error bg-error/10 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? 'Sending...' : 'Send Reset Link'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-body-sm text-primary font-semibold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
