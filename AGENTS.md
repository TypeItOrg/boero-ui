<!-- BEGIN:nextjs-agent-rules -->

# Next.js: ALWAYS read docs before coding

Before any Next.js work, find and read the relevant doc in `node_modules/next/dist/docs/`. Your training data is outdated — the docs are the source of truth.

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
