<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Authentication refresh invariants

- Deduplicate in-flight refresh requests by refresh endpoint and refresh token. Concurrent requests using the same rotating token must share one backend call.
- Treat frontend deduplication as an instance-local optimization. The backend replay cache is the cross-instance correctness boundary.
- After a successful refresh, propagate the rotated access and refresh tokens to both the browser response cookies and the current upstream request cookies.
- Clear authentication cookies only when the refresh endpoint definitively returns `401`. Preserve the refresh cookie after network errors, `5xx` responses, or malformed responses.

## Navigation and table invariants

- Mobile sidebar navigation marks only the clicked link active in the link event, suppressing the previous route's active style. On mobile, close through `setOpenMobile(false)` only after `pathname` matches the clicked destination and the shared 100 ms visual delay has elapsed; do not change desktop collapse state.
- All paginated tables use the shared page-size options `10, 20, 30, 40, 50`; selectors and query parsers must consume the same source.
- Form navigation uses `returnTo` for both cancellation and successful saves when a navigable origin exists, preserving list filters, pagination, search, and ordering.
- `returnTo` is restricted to internal paths (`/…`, never `//…` or absolute URLs); pages validate it before passing it to client forms, and Server Actions validate it again before redirecting.
- Sensitive account changes still force logout, and deletion flows keep their fixed list destinations instead of using `returnTo`.

## Type organization

- Define frontend API types manually from the payloads consumed by each feature; do not generate or synchronize TypeScript from OpenAPI.
- Each dedicated `*.types.ts` file contains exactly one top-level `type`, `interface`, or `enum` declaration.
- Import types from their specific files instead of introducing umbrella type files or barrels.

## New feature boundaries

- Validate Server Action bound arguments and form data at runtime; values bound by a client component are untrusted input.
- Validate raw form values before coercion. A missing or unknown boolean value is invalid input, never an implicit `false`.
- Use the shared authenticated API transport for server-side backend calls so authorization, no-store behavior, timeouts, and request headers remain consistent.
- Use Route Handlers for client-side reads that proxy backend data. Keep mutations and redirects in Server Actions.
- Use `useActionState` for Server Action forms and confirmation dialogs; it owns pending and returned validation/business errors. Use `useMutation` only when the client owns the mutated data through TanStack Query cache and the mutation rejects errors.
- Pass network promises to the shared action-error helper so transport failures and non-success HTTP responses use the same UI contract.
- Mount controlled confirmation dialogs only while open; keep them open while pending or after an error, and unmount them on close to reset action state.
- Paginate or search option catalogs through the API instead of loading every page into a form.
