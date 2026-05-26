'use client';

import { useState, useActionState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { resetPassword, type ActionResult } from '../../../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordRules } from '@/components/ui/PasswordRules';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const [passwordValue, setPasswordValue] = useState('');
  const [state, action, pending] = useActionState(resetPassword, null);
  const result = state as ActionResult | null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-6 py-12 md:py-16 bg-surface">
      <div className="w-full max-w-md space-y-3 md:space-y-4 text-center">
        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="SellSnap" width={108} height={36} priority />
        </Link>

        <Card className="p-4 md:p-6 space-y-6 shadow-none border-0 bg-transparent">
          <div className="space-y-2 text-center">
            <h1 className="text-h1 font-bold text-ink">Reset your password</h1>
            <p className="text-body text-ink-muted">
              Enter your new password below.
            </p>
          </div>

          <form action={action} noValidate className="space-y-4 text-left">
            <input type="hidden" name="token" value={token} />

            <Input
              label="New Password"
              name="password"
              id="reset-password"
              type="password"
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              required
              disabled={pending}
              revealable
              error={result?.fieldErrors?.password}
              onChange={(e) => setPasswordValue(e.target.value)}
            />

            {passwordValue.length > 0 && (
              <PasswordRules password={passwordValue} />
            )}

            <Input
              label="Confirm New Password"
              name="confirmPassword"
              id="reset-confirm-password"
              type="password"
              placeholder="Re-enter your new password"
              autoComplete="new-password"
              required
              disabled={pending}
              revealable
              error={result?.fieldErrors?.confirmPassword}
            />

            {result?.error && <ErrorBanner message={result.error} />}

            <Button type="submit" className="w-full mt-6" size="lg" disabled={pending}>
              {pending ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <p className="text-center text-body text-ink-muted">
            <Link href="/auth" className="text-brand font-semibold hover:underline">
              Back to login
            </Link>
          </p>
        </Card>
      </div>
    </main>
  );
}
