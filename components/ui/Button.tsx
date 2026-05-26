import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center rounded-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-on-primary hover:bg-primary/90',
        secondary: 'bg-secondary text-on-secondary hover:bg-secondary/90',
        surface: 'bg-surface-variant text-on-surface-variant hover:opacity-90',
        outline: 'border border-outline-variant text-on-surface hover:bg-surface-variant/30',
        ghost: 'text-on-surface hover:bg-surface-variant/30',
        danger: 'bg-error text-on-error hover:bg-error/90',
      },
      size: {
        sm: 'h-9 px-4 type-label-sm',
        md: 'h-11 px-6 type-label-md',
        lg: 'h-14 px-8 type-label-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
