---
name: vercel-react-best-practices
description: Investigate reported or measured React/Next.js performance problems using the relevant rule references.
license: MIT
metadata:
  author: vercel
  version: "1.0.0"
---

# React performance review

Identify the reported symptom or requested optimization, then inspect the relevant code and evidence. A normal React edit does not require a full performance audit.

Use only the appropriate rule category in `rules/`:
- Request waterfalls: `async-*`, `server-parallel-*`.
- Bundle/loading cost: `bundle-*`, `rendering-resource-hints.md`.
- Server boundaries: `server-auth-actions.md`, `server-no-shared-module-state.md`, `server-serialization.md`.
- Client requests: `client-*`.
- Render/state issues: `rerender-*`, `rendering-*`.
- Demonstrated hot paths: `js-*`.
- Effect lifecycle: `advanced-*`.

The [reference index](REFERENCE.md) maps individual rules. Read the rule needed, not every category.

Boero-specific boundaries take precedence over generic examples:
- Retain TanStack Query and existing shared components; an SWR example is not a reason to add another data library.
- Server Action forms use `useActionState`; Query mutations own cached client data. Do not migrate forms to `useTransition` solely for loading state.
- Preserve authenticated no-store reads and refresh/replay guarantees. Cross-request caches require correct tenant/authorization keys and invalidation; never cache tokens or request-local data by copying an example.
- Prefer native promises for ordinary concurrency. Examples using better-all or LRU packages do not authorize dependency additions.
- Optimize based on actual scale and behavior. Illustrative timings are not measurements of this application.

Report observed improvement separately from static reasoning, and preserve the user's functionality and scope.
