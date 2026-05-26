'use client';

import { OnboardingModal } from './OnboardingModal';

export function OnboardingGate({ hasSeenOnboarding, name }: { hasSeenOnboarding: boolean; name: string | null }) {
  if (hasSeenOnboarding) return null;
  return <OnboardingModal name={name} />;
}
