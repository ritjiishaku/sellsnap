'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { StepProgress, type StepStatus } from './StepProgress';
import { ProfileIllustration } from './Illustrations';
import { OnboardingProductForm } from './OnboardingProductForm';
import { Button } from '@/components/ui/Button';

async function markOnboardingSeen(): Promise<boolean> {
  try {
    const res = await fetch('/api/seller/onboarding-seen', { method: 'PATCH' });
    return res.ok;
  } catch {
    return false;
  }
}

const STEP_LABELS = ['Welcome', 'Profile', 'Product'];

export function OnboardingModal({ name }: { name: string | null }) {
  const [visible, setVisible] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const dismiss = useCallback(async (navigateTo?: string) => {
    try {
      const ok = await markOnboardingSeen();
      if (!ok) {
        setToast('Something went wrong. We\'ll sort it out.');
        await markOnboardingSeen();
      }
    } catch {
      setToast('Something went wrong. We\'ll sort it out.');
    } finally {
      setVisible(false);
      if (navigateTo) {
        router.push(navigateTo);
      }
    }
  }, [router]);

  const handleSkip = () => dismiss();

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleGetStarted = () => setStep(1);

  const handleLooksGood = () => setStep(2);

  const handleProductCreated = () => dismiss('/dashboard/products');

  if (!visible) return null;

  const stepsStatus = STEP_LABELS.map((label, i): { label: string; status: StepStatus } => {
    if (i < step) return { label, status: 'complete' };
    if (i === step) return { label, status: 'active' };
    return { label, status: 'pending' };
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-bg h-dvh">
      {/* Logo — centered */}
      <div className="flex items-center justify-center shrink-0 pt-6 pb-3">
        <Link href="/">
          <Image src="/logo.svg" alt="SellSnap" width={90} height={30} priority />
        </Link>
      </div>

      {/* Step progress — centered */}
      <div className="shrink-0 pb-4">
        <StepProgress steps={stepsStatus} />
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        <div className="flex flex-col items-center justify-center px-6 grow">
          <div className="w-full max-w-sm mx-auto flex flex-col items-center">

            {/* Step 0 — Welcome */}
            {step === 0 && (
              <div className="w-full flex flex-col items-center text-center">
                <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-brand/10">
                  <Image src="/logo.svg" alt="" width={44} height={44} />
                </div>
                <h1 className="text-h1 font-bold text-ink mb-2 leading-tight">
                  Welcome to SellSnap
                </h1>
                <p className="text-body text-ink-muted mb-8 leading-relaxed">
                  Get paid on WhatsApp in seconds. No store needed &mdash; just a link.
                </p>
                <Button onClick={handleGetStarted} className="w-full" size="lg">
                  Let&apos;s get started
                </Button>
                <button
                  onClick={handleSkip}
                  className="mt-3 w-full text-body-sm text-ink-subtle hover:text-ink-muted font-medium transition-colors cursor-pointer"
                >
                  I&apos;ll do this later
                </button>
              </div>
            )}

            {/* Step 1 — Profile */}
            {step === 1 && (
              <div className="w-full flex flex-col items-center text-center">
                <div className="mb-4">
                  <ProfileIllustration />
                </div>
                <h1 className="text-h1 font-bold text-ink mb-1 leading-tight">
                  Your profile looks great{name ? `, ${name}` : ''}
                </h1>
                <p className="text-body-sm text-ink-muted mb-6">
                  This is how buyers see your shop on every product page. You can update these anytime from settings.
                </p>
                <Button onClick={handleLooksGood} className="w-full" size="lg">
                  Looks good
                </Button>
                <div className="mt-3 w-full flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-body-sm text-ink-subtle hover:text-ink-muted font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    onClick={handleSkip}
                    className="text-body-sm text-ink-subtle hover:text-ink-muted font-medium transition-colors cursor-pointer"
                  >
                    I&apos;ll do this later
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 — Create Product */}
            {step === 2 && (
              <div className="w-full">
                <h2 className="text-h1 font-bold text-ink mb-1 text-center">Create your first product</h2>
                <p className="text-body-sm text-ink-muted text-center mb-4">
                  Add a product and we&apos;ll generate a shareable payment link instantly. You can always add more from your dashboard.
                </p>
                <div className="border-t border-border pt-4">
                  <OnboardingProductForm onProductCreated={handleProductCreated} />
                </div>
                <div className="mt-3 w-full flex items-center justify-between">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-1 text-body-sm text-ink-subtle hover:text-ink-muted font-medium transition-colors cursor-pointer"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                  <button
                    onClick={handleSkip}
                    className="text-body-sm text-ink-subtle hover:text-ink-muted font-medium transition-colors cursor-pointer"
                  >
                    I&apos;ll do this later
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-6 right-6 z-50 max-w-sm mx-auto bg-ink text-bg text-body-sm font-medium px-5 py-3 rounded-sm shadow-sm animate-in fade-in duration-200 text-center">
          {toast}
        </div>
      )}
    </div>
  );
}
