import { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  revealable?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, className, id, revealable, required, type, ...props }, ref) {
  const [revealed, setRevealed] = useState(false);
  const errorId = id ? `${id}-error` : undefined;

  const inputType = revealable && type === 'password'
    ? revealed ? 'text' : 'password'
    : type;

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={id} className="text-label-md font-medium text-ink-muted">
          {label}
          {required && <span className="text-error ml-0.5" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          ref={ref}
          id={id}
          type={inputType}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'flex h-12 w-full rounded-sm border-2 border-border bg-transparent px-4 py-2 text-body-md font-medium transition-colors duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-ink-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:border-brand disabled:cursor-not-allowed disabled:opacity-50 autofill:bg-transparent autofill:shadow-[0_0_0_30px_transparent_inset] autofill:[-webkit-text-fill-color:inherit]',
            revealable && 'pr-12',
            error && 'border-error focus-visible:ring-error',
            className
          )}
          {...props}
        />
        {revealable && type === 'password' && (
          <button
            type="button"
            onClick={() => setRevealed(!revealed)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-ink-muted/50 hover:text-ink-muted transition-colors cursor-pointer"
            aria-label={revealed ? 'Hide password' : 'Show password'}
          >
            {revealed ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && (
        <p id={errorId} className="text-label-sm text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});
