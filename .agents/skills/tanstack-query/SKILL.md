---
name: tanstack-query
description: Implement or debug React Query v5 caching, cancellation, pagination or client-owned mutations in Boero UI.
---

# React Query in Boero UI

Use the existing `src/app/providers.tsx` QueryClient and shared AsyncDropdown components. Follow the repository AGENTS.md: browser backend reads use explicit Route Handlers; Server Action forms use `useActionState`; Query mutations are for client-owned cached data and must reject unsuccessful responses.

Read only the applicable reference:
- [Queries and pagination](references/queries.md): query keys, cancellation, dependent catalogs and infinite pages.
- [Mutations](references/mutations.md): HTTP errors, cache updates, invalidation and optimistic rollback.
- [Server rendering](references/ssr.md): request isolation, prefetching and hydration.
- [Tests](references/testing.md): existing Query fixtures and targeted verification when requested.

Keep changes within the reported data flow. Do not install a second caching library, persistence plugin or devtools for an ordinary query fix. Check the installed v5 API when an example or remembered option is uncertain.
