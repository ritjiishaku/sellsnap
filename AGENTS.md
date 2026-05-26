# AGENTS.md — SellSnap

This file is the entry point for any AI agent working on the SellSnap codebase in Antigravity. Read this first, then load the rule files in `.agents/rules/` and the relevant skill in `skills/` before taking any action.

## What SellSnap Is

SellSnap is a link-based commerce platform for Nigerian social commerce sellers. A seller uploads a product, gets a unique shareable URL, sends it on WhatsApp or Instagram, and the buyer pays through a fast mobile checkout. Payments are processed by Flutterwave. That is the whole product. It is not a store builder, not a full e-commerce suite, not a marketplace. Every feature decision should be measured against one question: does this help a seller turn a WhatsApp message into a paid order faster?

## Who We Are Building For

Non-technical sellers on phones. Instagram vendors, WhatsApp sellers, freelancers, small business owners in Nigeria. They are mobile-first, often on slow networks, often on low-end Android devices. Agents must keep this user in mind at all times. Fancy animations, heavy JavaScript, multi-step onboarding, and desktop-only patterns are all wrong for this audience.

## Tech Stack

- Next.js (App Router) with React and TypeScript
- PostgreSQL for the database
- Prisma as the ORM
- Flutterwave for payments (not Paystack, regardless of what older documents say)
- Tailwind CSS for styling
- Server-side rendering for product pages so they load instantly and are shareable

## Project Structure

```
sellsnap/
├── AGENTS.md                      (this file)
├── .agents/
│   └── rules/                     (always-on rules for every task)
│       ├── architecture.md
│       ├── code-style.md
│       ├── design-system.md
│       └── security.md
├── skills/                        (load only when relevant to the task)
│   ├── flutterwave-integration/
│   ├── component-builder/
│   ├── api-route-scaffolder/
│   └── db-migration-runner/
└── workflows/                     (step-by-step recipes for common tasks)
    ├── new-component.md
    └── new-api-route.md
```

## How to Use These Files

**Rules in `.agents/rules/` are always in effect.** Load all four before starting any task. They cover architecture decisions, code style, the design system, and security requirements. Do not override them without explicit permission from the developer.

**Skills in `skills/` are loaded on demand.** When a task involves Flutterwave, read `skills/flutterwave-integration/SKILL.md` first. When building a UI component, read `skills/component-builder/SKILL.md`. When creating an API route, read `skills/api-route-scaffolder/SKILL.md`. When changing the database schema, read `skills/db-migration-runner/SKILL.md`. Never skip the skill file and try to work from memory.

**Workflows in `workflows/` are recipes.** Follow them in order when the task matches. They combine the rules and skills into a concrete sequence of steps.

## Non-Negotiables

1. Flutterwave is the payment gateway. If you see Paystack referenced anywhere in the product spec or old code, treat it as outdated and use Flutterwave.
2. Product pages must render on the server for speed and link previews.
3. Every payment must be verified on the server before an order is marked paid. Never trust the client.
4. Duplicate transaction references must be blocked at the database level, not just the application level.
5. Sensitive data (API keys, webhook secrets, database URLs) lives in environment variables and never in the codebase.
6. The product is built for Nigeria. Currency defaults to NGN. Phone number inputs expect Nigerian formats.

## When in Doubt

Ask the developer. Do not guess at payment logic, schema changes, or auth flows. Small guesses in those areas create bugs that cost real money.
