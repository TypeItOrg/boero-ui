# Server rendering and hydration

Boero uses Next.js App Router. Do not introduce Pages Router loaders or TanStack Router examples into this application.

The existing browser provider owns its QueryClient. Server prefetching needs a client scoped to the request/render workflow; never put user- or tenant-specific cached data into a module-level shared QueryClient.

Prefer existing Server Component reads and authenticated transport unless the requested UI actually needs hydrated client cache ownership. If hydration is needed, prefetch the relevant query into an isolated client and pass dehydrated data through HydrationBoundary.

Serialize only authorized data needed by the client. Query keys are not an authorization boundary. Choose a hydration staleTime based on acceptable freshness, rather than globally disabling refetches.

Reference: [TanStack advanced server rendering](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).
