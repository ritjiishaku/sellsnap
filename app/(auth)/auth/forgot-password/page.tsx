'use client';

import { useActionState } from 'react';
import Image from 'next/image';
import { requestPasswordReset, type ActionResult } from '../../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, null);
  const result = state as ActionResult | null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-6 py-12 md:py-16 bg-surface">
      <div className="w-full max-w-md space-y-3 md:space-y-4 text-center">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="SellSnap" width={108} height={36} priority />
        </Link>

        <Card className="p-4 md:p-6 space-y-6 shadow-none border-0 bg-transparent">
          {result?.success ? (
            // Success state updates in place — no full tree swap.
            <div className="space-y-4 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-h1 font-bold text-ink">Check your email</h1>
              <p className="text-body text-ink-muted">
                If an account with that email exists, we&apos;ve sent a password reset link. It expires in 1 hour.
              </p>
              <Link href="/auth" className="text-brand font-semibold hover:underline inline-block text-body">
                Back to login
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <h1 className="text-h1 font-bold text-ink">Forgot password</h1>
                <p className="text-body text-ink-muted">
                  Enter your email address and we&apos;ll send you a reset link.
                </p>
              </div>

              <form action={action} noValidate className="space-y-4 text-left">
                <Input
                  label="Email Address"
                  name="email"
                  id="forgot-email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  disabled={pending}
                  error={result?.fieldErrors?.email}
                />

                {result?.error && <ErrorBanner message={result.error} />}

                <Button type="submit" className="w-full mt-6" size="lg" disabled={pending}>
                  {pending ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>

              <p className="text-center text-body text-ink-muted">
                <Link href="/auth" className="text-brand font-semibold hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </Card>
      </div>
    </main>
  );
}
