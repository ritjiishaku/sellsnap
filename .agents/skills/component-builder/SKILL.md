# Component Builder Skill

Load this skill whenever you are creating or modifying a React component in SellSnap. It tells you where the component goes, how it should be structured, and how to wire it up to the design system without reinventing anything.

## Before You Start

Read `.agents/rules/design-system.md` first. Components that do not follow the design system get rejected at review. This skill assumes you already know the tokens, the spacing scale, and the component primitives.

Then ask: does this component already exist? Search `components/` before adding a new one. Two slightly different `Button` components is how codebases rot.

## Where Components Live

```
components/
├── ui/                  primitives: Button, Input, Card, Badge, Avatar, etc.
├── product/             anything specific to the product domain (ProductCard, ProductImage, PriceTag)
├── dashboard/           anything that only exists inside the seller dashboard (OrdersTable, ProductList)
└── shared/              composites used across more than one domain (EmptyState, PageHeader)
```

If a component is used exactly once and it is complex, it can live next to the page that uses it in `app/.../_components/`. Promote it to `components/` when a second caller shows up.

## Component File Template

```tsx
// components/<folder>/<ComponentName>.tsx

import { cn } from '@/lib/cn';

type <ComponentName>Props = {
  // Props go here. Required props first, optional after.
  children?: React.ReactNode;
  className?: string;
};

export function <ComponentName>({ children, className }: <ComponentName>Props) {
  return (
    <div className={cn('<base-classes>', className)}>
      {children}
    </div>
  );
}
```

Notes:
- Named export, not default export. Default exports make renaming harder and break auto-imports.
- `className` prop is always accepted on components that render a single root element, merged with `cn()` so callers can extend styling without forking.
- Props type goes above the component, named `<ComponentName>Props`.
- Required props come before optional ones in the type definition.

## Server vs. Client Components

Default to server components. A component becomes a client component only when it needs one of these:
- React state (`useState`, `useReducer`)
- Effects (`useEffect`, `useLayoutEffect`)
- Browser-only APIs (`window`, `document`, `localStorage`)
- Event handlers that are more than a simple link (`onClick`, `onChange`)
- Context consumption for interactivity

If you add `"use client"`, put it on the first line of the file. Do not add it defensively.

Keep the client boundary as low in the tree as possible. A page that is mostly static but has one interactive button should not be a client component; the button should be.

## Styling

Tailwind only. Class order: layout, box model, typography, visual. The Prettier plugin will sort classes; do not fight it.

Use the design tokens from `tailwind.config.ts`:
- `bg-brand`, `text-brand`, `border-brand` (mapped to `--color-brand`)
- `text-ink`, `text-ink-muted`, `text-ink-subtle`
- `bg-surface`, `bg-bg`
- Typography utilities: `text-display`, `text-h1`, `text-h2`, `text-body`, `text-body-sm`, `text-caption`

If you find yourself writing custom hex values or arbitrary Tailwind values like `text-[#1A7F3C]`, stop. Either use a token or add one to the config (with developer approval).

## Variants

For components with variants (Button, Badge), use a small typed map rather than a big `if/else` chain or `clsx` pyramid. `class-variance-authority` is already in the project:

```tsx
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const button = cva(
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-brand text-white hover:bg-brand-hover',
        secondary: 'bg-surface text-ink border border-border hover:bg-border/50',
        ghost: 'text-ink hover:bg-surface',
        danger: 'bg-danger text-white hover:opacity-90',
      },
      size: {
        sm: 'h-9 px-3 text-body-sm',
        md: 'h-11 px-4 text-body',
        lg: 'h-12 px-6 text-body',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
);

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size }), className)} {...props} />;
}
```

## Accessibility

Every interactive element needs a keyboard-reachable focus state. Tailwind's `focus-visible:ring-2 focus-visible:ring-brand` handles the common case.

Buttons without visible text need `aria-label`. Icon-only buttons are the most common offender. Do not let them ship without a label.

Form inputs need associated labels via `htmlFor`/`id`. Error messages are linked via `aria-describedby`.

Images need `alt`. Decorative images use `alt=""`. Do not omit the attribute.

## Props to Avoid

- Do not expose raw color props (`color="red"`). Use variants.
- Do not expose raw size values in pixels. Use the size variants.
- Do not accept arbitrary inline styles via a `style` prop unless there is a specific reason (like a dynamic value that cannot be expressed in Tailwind).

## Testing a New Component

If the component is a primitive (lives in `ui/`), write a simple Storybook-style manual-check by importing it into `app/_dev/page.tsx` (a dev-only route gated by `NODE_ENV === 'development'`). Verify:
- Default appearance
- Every variant
- Every size
- Disabled state (if applicable)
- Focus state (tab into it)
- Hover state
- On mobile viewport (Chrome DevTools at 360px wide)

Domain components (product, dashboard) can be reviewed in place on the relevant page.

## Common Mistakes

- Creating a new primitive when an existing one would work with a new variant. Extend, do not duplicate.
- Forgetting `className` prop on a component that might need to be laid out differently in different places.
- Making a component a client component because it was easier, when a server component would have worked.
- Using pixel values instead of the spacing scale. `mt-3` not `style={{ marginTop: '12px' }}`.
- Hardcoding colors instead of using design tokens.
- Adding complex logic inside the JSX. Extract to a named constant or helper above the return.
