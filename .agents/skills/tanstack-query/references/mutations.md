# Client-owned mutations

Use mutations when the client owns the affected Query cache. Keep Server Action forms and confirmation dialogs on the repository's `useActionState` contract.

A mutation function must throw/reject for a transport or non-success HTTP response. Reuse `src/common/utils/http-response-error.util.ts`; calling `response.json()` alone can turn a JSON error response into success.

Choose the cache update for the actual response:
- If the response provides authoritative updated data, update the relevant cache entries.
- Invalidate affected queries when they need server recomputation. Do not invalidate the entire cache by default.
- Await invalidation when completion depends on refreshed data; it is not necessary for every mutation.

Use optimistic updates only when the UX needs them and rollback can be correct. Cancel conflicting reads, snapshot relevant data, update the cache, and restore the snapshot on failure. Account for concurrent mutations; a stale rollback must not overwrite a later successful operation.

Reference: [TanStack Query v5 mutations](https://tanstack.com/query/latest/docs/framework/react/guides/mutations).
