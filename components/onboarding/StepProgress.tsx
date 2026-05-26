'use client';

import { cn } from '@/lib/cn';
import { Check } from 'lucide-react';

export type StepStatus = 'complete' | 'active' | 'pending';

export interface Step {
  label: string;
  status: StepStatus;
}

export function StepProgress({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center justify-center">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center gap-1">
            <div
              className={cn(
                'flex items-center justify-center w-9 h-9 rounded-lg border-2 transition-all duration-200',
                step.status === 'complete' && 'bg-brand border-brand',
                step.status === 'active' && 'border-brand bg-brand/5',
                step.status === 'pending' && 'border-border bg-bg'
              )}
            >
              {step.status === 'complete' ? (
                <Check size={16} className="text-on-brand" strokeWidth={3} />
              ) : (
                <span
                  className={cn(
                    'text-body-sm font-semibold',
                    step.status === 'active' && 'text-brand',
                    step.status === 'pending' && 'text-ink-subtle'
                  )}
                >
                  {i + 1}
                </span>
              )}
            </div>
            <span
              className={cn(
                'text-label-sm text-center leading-tight',
                step.status === 'complete' && 'text-brand font-semibold',
                step.status === 'active' && 'text-ink font-semibold',
                step.status === 'pending' && 'text-ink-subtle'
              )}
            >
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div
              className={cn(
                'w-8 h-0.5 mx-1.5 mb-5 transition-all duration-200',
                step.status === 'complete' ? 'bg-brand' : 'bg-border'
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
