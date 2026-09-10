# Queries and pagination

Use the existing catalog implementation as the starting point:
- `src/common/components/ui/async-dropdown.tsx`
- `src/common/types/async-dropdown-fetch-page-input.types.ts`
- `src/common/utils/to-async-dropdown-page.util.ts`

Include every response-changing input in the query key, including scope, institution and parent catalog identifiers where relevant. Clear or separate dependent selections when their parent changes; do not show data from another tenant or parent under a reused key.

Forward the provided AbortSignal to fetch so obsolete catalog requests can be cancelled. Pass non-success responses through the shared HTTP error parser; fetch resolving does not mean HTTP success.

Use `enabled` for ordinary dependent queries. Suspense hooks have different options; do not assume an enabled flag gates `useSuspenseQuery`. Match pending/loading UI to whether data exists and whether a fetch is actually running.

Infinite queries require `initialPageParam` and an accurate next-page boundary. Reuse the existing page adapter rather than inferring another page from a full page alone. Avoid concurrent next-page requests.

For previous-page placeholders, specify `placeholderData` once and use it only when showing prior data is appropriate. Do not carry prior-tenant or prior-parent results into a new catalog.

Select staleTime, gcTime and refetch behavior from freshness and reuse needs. Inactive data may be collected; active observers and freshness are distinct. Change these settings only for the affected query unless a global policy change was requested.

Reference: [TanStack Query v5 queries](https://tanstack.com/query/latest/docs/framework/react/guides/queries).
