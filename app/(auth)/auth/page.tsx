'use client';

import { useState, useActionState, useEffect, useRef, use, startTransition } from 'react';
import Image from 'next/image';
import { z } from 'zod';
import { ArrowRight } from 'lucide-react';
import { login, signup, type ActionResult } from '../actions';
import { signupStep1Schema } from '@/lib/validators/auth';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordRules } from '@/components/ui/PasswordRules';
import { ErrorBanner } from '@/components/ui/ErrorBanner';
import { Card } from '@/components/ui/Card';
import Link from 'next/link';

type AuthMode = 'login' | 'signup';

export default function AuthPage({ searchParams }: { searchParams: Promise<{ mode?: string }> }) {
  const resolved = use(searchParams);
  const [mode, setMode] = useState<AuthMode>(resolved.mode === 'signup' ? 'signup' : 'login');
  const [signupStep, setSignupStep] = useState(1);
  const nameRef = useRef<HTMLInputElement>(null);

  // Keep mode in sync if the user navigates back/forward via the browser.
  useEffect(() => {
    startTransition(() => {
      setMode(resolved.mode === 'signup' ? 'signup' : 'login');
    });
  }, [resolved.mode]);

  useEffect(() => {
    if (mode === 'signup' && signupStep === 1) {
      nameRef.current?.focus();
    }
  }, [mode, signupStep]);

  const [stepOneErrors, setStepOneErrors] = useState<Record<string, string>>({});

  // Controlled state for Step 1 fields — persisted so hidden inputs in Step 2 are always populated.
  const [nameValue, setNameValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [businessValue, setBusinessValue] = useState('');

  const validateName = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0 && trimmed.length < 2) {
      setStepOneErrors(prev => ({ ...prev, name: 'Full name must be at least 2 characters' }));
    } else if (trimmed.length >= 2) {
      setStepOneErrors(prev => { const r = { ...prev }; delete r.name; return r; });
    }
  };

  const validateNameOnBlur = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setStepOneErrors(prev => ({ ...prev, name: 'Your name — what should we call you?' }));
    }
  };

  // Use the same Zod schema as the server for email validation — no more regex mismatch.
  const emailValidator = z.string().email();

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    const valid = emailValidator.safeParse(trimmed).success;
    if (trimmed.length > 0 && !valid) {
      setStepOneErrors(prev => ({ ...prev, email: 'Enter a valid email address' }));
    } else if (valid) {
      setStepOneErrors(prev => { const r = { ...prev }; delete r.email; return r; });
    }
  };

  const validateEmailOnBlur = (value: string) => {
    const trimmed = value.trim();
    if (!emailValidator.safeParse(trimmed).success && trimmed.length > 0) {
    }
  };

  const validateBusinessName = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length > 0) {
      setStepOneErrors(prev => { const r = { ...prev }; delete r.businessName; return r; });
    }
  };

  const validateBusinessNameOnBlur = (value: string) => {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      setStepOneErrors(prev => ({ ...prev, businessName: 'Your business name is how buyers find you — what is it?' }));
    }
  };

  const [passwordValue, setPasswordValue] = useState('');
  const [loginState, loginAction, loginPending] = useActionState(login, null);
  const [signupState, signupAction, signupPending] = useActionState(signup, null);

  const isPending = mode === 'login' ? loginPending : signupPending;

  const loginErrors = loginState as ActionResult | null;
  const signupErrors = signupState as ActionResult | null;

  const [loginErrorDismissed, setLoginErrorDismissed] = useState(false);

  useEffect(() => {
    if (loginErrors) startTransition(() => setLoginErrorDismissed(false));
  }, [loginErrors]);

  const dismissLoginError = () => setLoginErrorDismissed(true);

  const toggle = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setSignupStep(1);
    setStepOneErrors({});
    setNameValue('');
    setEmailValue('');
    setBusinessValue('');
  };

  const handleContinue = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();

    const validated = signupStep1Schema.safeParse({ name, email });
    if (!validated.success) {
      const errors: Record<string, string> = {};
      for (const issue of validated.error.issues) {
        const key = issue.path[0] as string;
        if (!errors[key]) errors[key] = issue.message;
      }
      // Apply friendly overrides for empty fields.
      if (!name) errors.name = 'Your name — what should we call you?';
      if (!email) errors.email = 'We need your email to create your account.';
      setStepOneErrors(errors);
      return;
    }

    // Persist values into state BEFORE advancing — hidden fields in Step 2 depend on these.
    setNameValue(name);
    setEmailValue(email);
    setSignupStep(2);
    setPasswordValue('');
    setBusinessValue('');
    setStepOneErrors({});
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 md:px-6 py-12 md:py-16 bg-surface-variant/20">
      <div className="w-full max-w-md space-y-3 md:space-y-4 text-center">
        {mode === 'login' && loginErrors?.error && !loginErrorDismissed && (
          <div className="w-full animate-in fade-in slide-in-from-top-2 duration-300">
            <ErrorBanner message={loginErrors.error} />
          </div>
        )}

        <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
          <Image src="/logo.svg" alt="SellSnap" width={108} height={36} priority />
        </Link>

        <Card className="p-4 md:p-6 space-y-6 shadow-none border-0 bg-transparent">
          {mode === 'login' ? (
            <>
              <div className="space-y-2 text-center">
                <h1 className="type-headline-sm md:type-headline-md font-bold text-on-surface">Welcome back</h1>
                <p className="type-body-md text-on-surface-variant">
                  Log in to manage your products and track orders.
                </p>
              </div>

              <form key="login-form" action={loginAction} noValidate className="space-y-4 text-left">
                <Input
                  label="Email Address"
                  name="email"
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  disabled={isPending}
                  error={loginErrors?.fieldErrors?.email}
                  onFocus={dismissLoginError}
                />
                <Input
                  label="Password"
                  name="password"
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  disabled={isPending}
                  revealable
                  error={loginErrors?.fieldErrors?.password}
                  onFocus={dismissLoginError}
                />

                <div className="text-right -mt-2">
                  <Link href="/auth/forgot-password" className="type-label-md text-primary font-semibold hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full mt-6" size="lg" disabled={isPending}>
                  {isPending ? 'Logging in...' : 'Log In'}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="space-y-2 text-center">
                <h1 className="type-headline-sm md:type-headline-md font-bold text-on-surface">Create an account</h1>
                <p className="type-body-md text-on-surface-variant">
                  Join thousands of sellers turning messages into money.
                </p>
              </div>

              {signupStep === 1 ? (
                <form key="signup-step1" onSubmit={handleContinue} noValidate className="space-y-4 text-left">
                  <Input
                    ref={nameRef}
                    label="Full Name"
                    name="name"
                    id="name"
                    placeholder="e.g. Chioma Okafor"
                    autoComplete="name"
                    required
                    disabled={isPending}
                    error={stepOneErrors.name}
                    value={nameValue}
                    onChange={(e) => { setNameValue(e.target.value); validateName(e.target.value); }}
                    onBlur={(e) => { validateNameOnBlur(e.target.value); }}
                  />
                  <Input
                    label="Email Address"
                    name="email"
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    required
                    disabled={isPending}
                    error={stepOneErrors.email}
                    value={emailValue}
                    onChange={(e) => { setEmailValue(e.target.value); validateEmail(e.target.value); }}
                    onBlur={(e) => validateEmailOnBlur(e.target.value)}
                  />

                  <Button type="submit" className="w-full mt-6" size="lg">
                    Continue
                    <ArrowRight size={20} className="ml-2" />
                  </Button>
                </form>
              ) : (
                <form key="signup-step2" action={signupAction} noValidate className="space-y-4 text-left">
                  {/*
                   * Hidden fields carry Step 1 data to the server.
                   * Values are sourced from React state set in handleContinue — never
                   * from raw searchParams or URL input. Do not change this without
                   * reviewing the XSS implications.
                   */}
                   <input type="hidden" name="name" value={nameValue} />
                  <input type="hidden" name="email" value={emailValue} />

                  <Input
                    label="Business Name"
                    name="businessName"
                    id="businessName"
                    placeholder="e.g. Chi's Accessories"
                    autoComplete="organization"
                    required
                    disabled={isPending}
                    error={stepOneErrors.businessName || signupErrors?.fieldErrors?.businessName}
                    value={businessValue}
                    onChange={(e) => { setBusinessValue(e.target.value); validateBusinessName(e.target.value); }}
                    onBlur={(e) => { validateBusinessNameOnBlur(e.target.value); }}
                  />

                  <Input
                    label="Create Password"
                    name="password"
                    id="signup-password"
                    type="password"
                    placeholder="Min. 8 characters"
                    autoComplete="new-password"
                    required
                    disabled={isPending}
                    revealable
                    error={signupErrors?.fieldErrors?.password}
                    onChange={(e) => setPasswordValue(e.target.value)}
                  />

                  {passwordValue.length > 0 && (
                    <PasswordRules password={passwordValue} />
                  )}

                  {signupErrors?.error && <ErrorBanner message={signupErrors.error} />}
                  {signupErrors?.fieldErrors?.email && (
                    <ErrorBanner message={signupErrors.fieldErrors.email} />
                  )}

                  <div className="mt-6 space-y-3">
                    <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                      {isPending ? 'Creating account...' : 'Create Account'}
                    </Button>
                    <button
                      type="button"
                      onClick={() => {
                        setSignupStep(1);
                        setPasswordValue('');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full text-center type-label-md text-primary font-semibold hover:underline cursor-pointer py-3"
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <p className="text-center type-body-md text-on-surface-variant">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button onClick={toggle} className="text-primary font-semibold hover:underline cursor-pointer py-3 px-1">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={toggle} className="text-primary font-semibold hover:underline cursor-pointer py-3 px-1">
                  Log in
                </button>
              </>
            )}
          </p>
        </Card>
      </div>
    </main>
  );
}
