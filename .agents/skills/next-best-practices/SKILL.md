---
name: next-best-practices
description: Resolve Next.js routing, server/client boundaries, async APIs and deployment behavior using relevant installed-version documentation.
---

# Next.js decisions

Use this skill when Next-specific behavior is material to the task. Prefer the relevant guide shipped with the installed Next version over an older copied example. A content-only edit does not need a framework survey.

Read only the reference matching the unresolved question:
- Routing and file conventions: [files](file-conventions.md), [parallel/intercepting routes](parallel-routes.md).
- Server/client boundaries: [RSC](rsc-boundaries.md), [directives](directives.md), [async APIs](async-patterns.md).
- Data flow: [data patterns](data-patterns.md), [Route Handlers](route-handlers.md), [functions](functions.md).
- Failures: [errors](error-handling.md), [hydration](hydration-error.md), [Suspense](suspense-boundaries.md).
- Assets: [metadata](metadata.md), [images](image.md), [fonts](font.md), [scripts](scripts.md).
- Runtime/deployment: [runtime](runtime-selection.md), [bundling](bundling.md), [self-hosting](self-hosting.md).
- Requested runtime diagnosis: [debugging](debug-tricks.md).

Preserve the Boero transport, authorization, returnTo and action-state contracts in AGENTS.md. Generic examples do not authorize a catch-all proxy, cache-policy change, package installation or deployment.
