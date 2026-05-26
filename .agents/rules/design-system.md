# Design System Rules

SellSnap has its own visual language. It is built for Nigerian sellers on mobile phones, not for enterprise SaaS buyers on desktops. The design must feel fast, confident, and trustworthy, because buyers are handing over money to a stranger on WhatsApp and the interface is what earns that trust.

## Design Principles

**Speed first.** If a visual choice slows down the page, it loses. No loading spinners on the product page. No blocking fonts. No animations on the critical path.

**Mobile first.** Design for a 360px-wide screen and scale up. A buyer reading WhatsApp on a $100 Android phone is the default user, not a designer on a 27-inch monitor.

**Trust through clarity.** Clean typography, generous spacing, real product imagery, and obvious call-to-action buttons. Nothing clever that makes the buyer wonder if they are on a scam page.

**Calm over clever.** No shadows stacked on shadows. No gradients for their own sake. No dark patterns around the "Pay Now" button. The interface should feel like it was built by adults who respect the buyer's time.

## Color System

The palette is intentionally small. Adding new colors requires a conversation.

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#FFFFFF` | Default page background |
| `--color-surface` | `#F7F7F5` | Cards, elevated surfaces |
| `--color-surface-variant` | `#F0F0EE` | Secondary surfaces, table headers |
| `--color-ink` | `#0F1115` | Primary text, headlines |
| `--color-ink-muted` | `#5A6270` | Secondary text, labels |
| `--color-ink-subtle` | `#9AA1AD` | Captions, placeholder text |
| `--color-border` | `#E5E7EB` | Dividers, input borders |
| `--color-brand` | `#1A7F3C` | Primary actions, brand accents |
| `--color-brand-hover` | `#16692F` | Hover state for brand actions |
| `--color-success` | `#15803D` | Success states, paid badges |
| `--color-warning` | `#B45309` | Pending states |
| `--color-danger` | `#B91C1C` | Errors, failed payments |

Legacy tokens still in active use (transitional, prefer new tokens for new code):
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#1A7F3C` | Same as brand — used in Button, auth/landing pages |
| `--color-on-primary` | `#FFFFFF` | Text on primary buttons |
| `--color-secondary` | `#16692F` | Same as brand-hover — secondary Button variant |
| `--color-on-secondary` | `#FFFFFF` | Text on secondary buttons |
| `--color-on-surface` | `#0F1115` | Same as ink — auth/landing text |
| `--color-on-surface-variant` | `#5A6270` | Same as ink-muted — auth/landing secondary text |
| `--color-outline` | `#9AA1AD` | Same as ink-subtle |
| `--color-outline-variant` | `#E5E7EB` | Same as border — Button outline variant |
| `--color-inverse-on-surface` | `#F0FDF4` | Inverse text (used rarely) |
| `--color-error` | `#B91C1C` | Same as danger |

Brand green was chosen deliberately. It reads as money, growth, and trust in the Nigerian context. It is not the Paystack blue or the Flutterwave orange, so SellSnap looks like its own product.

Dark mode is not a launch feature. We will add it later. Do not build two themes now.

## Typography

One typeface: Inter, loaded as a variable font. Fall back to the system sans-serif stack so text is never blank while the font loads.

Two type scales exist (transitional phase — prefer the design system utilities for new code):

### Design system utilities (new)
| Utility | Size | Line height | Weight | Usage |
|---------|------|-------------|--------|-------|
| `text-display` | 32px | 38px | 700 | Product name on product page, dashboard page titles |
| `text-h1` | 24px | 30px | 700 | Section headings |
| `text-h2` | 20px | 26px | 600 | Card titles |
| `text-body` | 16px | 24px | 400 | Default body text |
| `text-body-sm` | 14px | 20px | 400 | Secondary text, labels |
| `text-caption` | 12px | 16px | 500 | Tags, metadata, timestamps |

### Legacy type utilities (still used in auth/landing/Button)
| Utility | Usage |
|---------|-------|
| `type-display-sm` / `type-display-md` / `type-display-lg` | Landing page hero |
| `type-headline-sm` / `type-headline-md` | Auth section headings |
| `type-body-md` / `type-body-lg` | Auth/landing body text |
| `type-label-sm` / `type-label-md` / `type-label-lg` | Button sizes, secondary labels |

Do not add new type utilities outside this scale. Migrate legacy uses to design system utilities when touching a file.

## Spacing

Use the Tailwind spacing scale, which is based on 4px increments. Be generous with whitespace, especially on mobile. A cramped interface feels cheap. A spacious one feels considered.

Common patterns:
- Page padding on mobile: `px-4` (16px)
- Page padding on desktop: `px-6` (24px), max content width `max-w-2xl` for product pages, `max-w-5xl` for dashboard
- Section spacing: `py-8` (32px) to `py-12` (48px)
- Card padding: `p-4` on mobile, `p-6` on desktop
- Gap between related items: `gap-3` (12px)
- Gap between unrelated sections: `gap-8` (32px) or more

## Components

Primitives live in `components/ui/`. Compose them, do not replicate them.

### Button

Six variants: `primary`, `secondary`, `surface`, `outline`, `ghost`, `danger`. Three sizes: `sm`, `md`, `lg`. The default is `md`. The "Pay Now" button on the product page is always `primary` and `lg`.

- **Primary** — `bg-primary text-on-primary hover:bg-primary/90`
- **Secondary** — `bg-secondary text-on-secondary hover:bg-secondary/90`
- **Surface** — `bg-surface-variant text-on-surface-variant hover:opacity-90`
- **Outline** — `border border-outline-variant text-on-surface hover:bg-surface-variant/30`
- **Ghost** — `text-on-surface hover:bg-surface-variant/30`
- **Danger** — `bg-error text-on-error hover:bg-error/90`

Size classes: `sm` (`type-label-sm`, h-9), `md` (`type-label-md`, h-11), `lg` (`type-label-lg`, h-14).

Buttons are full-width on mobile when they are the primary action on a screen. A full-width "Pay Now" button is easier to tap than a centered small one.

### Input

Single input style. Label sits above the input, not inside it. Placeholder text is never a substitute for a label. Error messages appear below the input in `--color-danger`. Focused state uses a `--color-brand` ring.

Inputs are at least 44px tall on mobile to meet touch target guidelines. Do not shrink them to save space.

Current implementation:
- Border: `border-border` with `focus-visible:border-brand`
- Focus ring: `focus-visible:ring-brand`
- Label: `text-ink-muted` in `text-label-md`
- Placeholder: `text-ink-subtle`
- Password toggle: `text-ink-muted`

### Card

Rounded corners (`rounded-xl`, 12px), subtle border (`border-border`), no drop shadow by default. Add `shadow-sm` only when a card needs to float above a busy background.

### Badge

Used for order status. `pending` is warning, `paid` is success, `failed` is danger. Small, rounded-full, uppercase text at 10px.

## Product Page Layout

This is the most important page. Follow the layout exactly:

1. Product image fills the top of the viewport, 1:1 aspect ratio on mobile, 4:3 or 1:1 on desktop depending on the image.
2. Seller's business name sits just below the image in `text-body-sm`, muted.
3. Product name in `text-display`.
4. Price in `text-h1`, bold, with currency symbol (`₦`) and comma grouping.
5. Description in `text-body`.
6. "Pay Now" button, full-width, `primary` variant, `lg` size, anchored to the bottom of the viewport on mobile via `sticky bottom-0`.

The total above-the-fold content on mobile should be: image, name, price, Pay Now button. Description sits below the fold but should be reachable with one scroll.

## Dashboard Layout

Left sidebar on desktop with Products, Orders, Settings. Collapses to a top bar on mobile. The main content area is a single column with `max-w-5xl`. Do not build multi-column dashboards; the data is simple and a single column is easier to scan.

Current implementation uses `bg-bg` for page background, `border-border` for sidebar borders, `bg-surface` for sidebar, header, and table header background. Product/order text uses `text-ink`, `text-ink-muted`, `text-brand`.

## Iconography

Lucide React. One icon library, no mixing. Icons are 20px inside buttons, 24px in nav, 16px inline with text. Icons always have an accessible label via `aria-label` or visible text.

## Motion

Keep it minimal. Use Tailwind's built-in `transition` utilities for hover and focus states. Durations under 200ms. No page transitions, no elaborate enter animations. The "Pay Now" button should never have a delay between tap and action.

## Accessibility

Every interactive element is reachable by keyboard. Focus states are visible and use `--color-brand` (or `--color-primary` in legacy components). Color contrast meets WCAG AA against both light backgrounds.

Form inputs have associated labels. Error messages are linked to their inputs with `aria-describedby`. Buttons have text or an `aria-label`.

Images have `alt` text. Product images use the product name as alt text. Decorative images use `alt=""`.

## What Not to Do

- Do not add skeumorphic effects, glassmorphism, or neumorphism. They go out of style fast and cost performance.
- Do not use more than two font weights in a single screen (regular and bold is usually enough, plus semibold for headings).
- Do not center-align body text. Left-align everything except buttons and single-line headings.
- Do not build carousels on the product page. One product, one image, one price. Carousels hurt conversion.
- Do not stack multiple modals. If a flow needs two decisions, it needs two pages.

## Migration Notes

The codebase is in a transitional state. New files and recently-touched files use the design system tokens (`text-ink`, `text-body`, `border-border`, `bg-surface`, etc.). Legacy files (landing page, auth page, Button component) still use the old Material-style tokens. When working on a file, prefer the design system tokens but do not change a file's token style unless it is part of the task. The two systems are aliased in globals.css so they coexist.
