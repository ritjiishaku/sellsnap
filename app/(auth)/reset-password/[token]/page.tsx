'use client';

import { useState, useRef } from 'react';
import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { resetPassword } from '../../actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordRules } from '@/components/ui/PasswordRules';
import { CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const formRef = useRef<HTMLFormElement>(null);
  const [password, setPassword] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;

    setIsPending(true);
    setError(null);

    const formData = new FormData(formRef.current);
    const result = await resetPassword(null, formData);

    if ('error' in result && result.error) {
      setError(result.error);
      setIsPending(false);
      return;
    }

    setSuccess(true);
    setIsPending(false);
  };

  if (success) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-6 py-12 md:py-16 bg-surface-variant/20">
        <div className="w-full max-w-md space-y-6 text-center">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image src="/logo.svg" alt="SellSnap" width={108} height={36} priority />
          </Link>
          <div className="bg-brand/10 p-4 rounded-full w-fit mx-auto">
            <CheckCircle2 className="h-8 w-8 text-brand" />
          </div>
          <div className="space-y-2">
            <h1 className="text-h1 font-bold text-ink">Password reset</h1>
            <p className="text-body text-ink-muted leading-relaxed">
              Your password has been updated successfully.
            </p>
          </div>
          <Link href="/auth">
            <Button className="w-full">Log In</Button>
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
          <h1 className="text-h1 font-bold text-ink">Set new password</h1>
          <p className="text-body text-ink-muted">
            Enter your new password below.
          </p>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
          <input type="hidden" name="token" value={token} />

          <Input
            label="New Password"
            name="password"
            type="password"
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            required
            revealable
            disabled={isPending}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {password.length > 0 && <PasswordRules password={password} />}

          <Input
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Re-enter your password"
            autoComplete="new-password"
            required
            disabled={isPending}
          />

          {error && (
            <p className="text-body-sm text-error bg-error/10 p-3 rounded-lg text-center">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isPending}>
            {isPending ? 'Resetting...' : 'Reset Password'}
          </Button>
        </form>

        <div className="text-center">
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-body-sm text-primary font-semibold hover:underline"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
