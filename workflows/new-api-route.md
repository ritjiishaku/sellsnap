# Workflow: Creating a New API Route

Follow this workflow when you need to add a new API route or server action to SellSnap. It chains the architecture, security, and code style rules with the route scaffolder skill so the new endpoint fits the codebase and does not introduce a security hole.

## Before You Touch Any File

**Step 1. Decide: route handler or server action?**

- Called by our own dashboard UI as a form submit or UI-triggered mutation → **server action** in `app/(dashboard)/.../actions.ts`.
- Called by the public product page, a third party, or a webhook → **route handler** in `app/api/.../route.ts`.

Server actions are the default for internal writes. Route handlers are for boundaries.

**Step 2. Decide on the data model.**

Sketch the input and the output on paper before writing code. What fields come in? What gets validated? What table rows are read or written? What does success look like? What does failure look like?

If the route writes money, the sketch must include idempotency: what happens if this runs twice? See `skills/flutterwave-integration/SKILL.md` for the pattern.

**Step 3. Load the right context.**

Open and read in order:

1. `.agents/rules/architecture.md` — where the route lives, data flow conventions.
2. `.agents/rules/security.md` — the non-negotiables for input validation, auth, and secrets.
3. `.agents/rules/code-style.md` — naming, error handling, logging patterns.
4. `skills/api-route-scaffolder/SKILL.md` — the route template and envelope convention.
5. If the route interacts with Flutterwave: `skills/flutterwave-integration/SKILL.md`.
6. If the route changes the schema: `skills/db-migration-runner/SKILL.md`.

## Build It

**Step 4. Create the file.**

Use the appropriate template from `skills/api-route-scaffolder/SKILL.md`. Route handlers go at `app/api/<resource>/<action>/route.ts`. Server actions go in a sibling `actions.ts` of the page that triggers them, with `"use server"` at the top.

**Step 5. Write the zod schema first.**

Before any business logic, define the `inputSchema`. Every field the endpoint accepts is in the schema. Nothing outside the schema is trusted. If the client sends a field you did not declare, zod strips it.

**Step 6. Authenticate, then authorize.**

Authenticate: is there a valid session? If not, return `401`.

Authorize: does this session have permission to do this specific thing on this specific resource? Check ownership explicitly: `product.userId === session.userId`. Do not rely on the URL shape to enforce ownership; a crafted URL can target any row.

Some routes are intentionally public (the order creation endpoint called from the product page, the Flutterwave webhook). Those need different protections: rate limiting and signature verification, respectively.

**Step 7. Validate again at the boundaries.**

If the route accepts a URL parameter or query string, validate it too. Prisma will not magically protect you from `findUnique({ where: { id: 'DROP TABLE' }})`; that specific example is safe because Prisma parameterizes, but the principle is that all outside input gets validated.

**Step 8. Do the work.**

Keep the body of the try block short. If it is more than ~30 lines, extract the core logic into a function in `lib/`. Route handlers are thin.

Use `db.$transaction` when two or more writes must succeed together. The order creation flow is a good example: insert the order and the initial payment record together, not one at a time.

**Step 9. Return the consistent envelope.**

Success: `{ ok: true, data }`.
Failure: `{ ok: false, error: { code, message } }`.

Use proper HTTP status codes: `200` success, `400` invalid input, `401` unauthenticated, `403` unauthorized, `404` not found, `409` conflict, `429` rate limited, `500` server error.

**Step 10. Log the right things.**

On success, a single structured log line: `logger.info('order.created', { orderId, productId })`.
On failure, log the error with context: `logger.error('order.create.failed', { error, productId })`.
Never log passwords, session tokens, payment secrets, or full card data.

**Step 11. Revalidate caches (server actions only).**

If the action mutates data that is displayed elsewhere, call `revalidateTag` or `revalidatePath` so the cache updates. Forget this and the UI will serve stale data.

## Check Your Work

**Step 12. Walk the security checklist.**

- [ ] Input validated with zod.
- [ ] Session checked (if the route is not intentionally public).
- [ ] Ownership check in place where relevant.
- [ ] Rate limit in place if the route is public.
- [ ] No raw error messages returned to the client.
- [ ] No secrets logged.
- [ ] Idempotency handled if the route involves payment or creates billable records.
- [ ] Database writes that must happen together are in a `db.$transaction`.

**Step 13. Test the happy path and the unhappy paths.**

Hit the route with valid input. Confirm success.
Hit it with missing fields. Confirm the 400 response.
Hit it without a session (if auth is required). Confirm the 401.
Hit it with a session that does not own the resource. Confirm the 403.
If the route has a unique constraint, hit it twice and confirm the second call is handled cleanly.

**Step 14. Check the network tab.**

Confirm the actual HTTP status code matches what you intended. Confirm the response body matches the envelope. Confirm no secret data is leaking in the response.

**Step 15. Commit.**

Commit message says what the route does in one line. If it is part of a larger feature, reference the feature in the body.

## When Things Go Wrong

If the route starts to do too many things (creating three records, sending two emails, calling Flutterwave, and updating five caches), stop. That is a sign the logic should move into a service function in `lib/` that the route thinly wraps. Route handlers are about translating HTTP to function calls, not about orchestration.

If you need to change the database schema to support this route, stop and read `skills/db-migration-runner/SKILL.md` before touching `prisma/schema.prisma`. Schema changes deserve their own commit and their own migration, separate from the route that depends on them.
