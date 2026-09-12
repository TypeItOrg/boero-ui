# Adding and updating components

Read `components.json` for aliases and primitive family, and inspect the existing UI directory before adding a component. An installed component should be reused, not regenerated for a routine fix.

Use the installed CLI's `info`, `docs`, `search` or `view` only when each resolves a specific question. Fetch documentation URLs returned by `docs` when the actual API is unclear. Registry additions belong to an authorized component request, not to a general review.

For a requested update, inspect the affected file list and upstream diff before applying it. The [CLI reference](../cli.md) describes preview options; use local help to resolve version differences. Read the current file and preserve custom variants, accessibility behavior and imports.

A request to update while keeping local changes calls for a merge. A request explicitly authorizing replacement permits that replacement without another approval loop. If the request leaves material data loss unresolved, first prepare the concrete diff and ask about that choice.

After adding third-party code, inspect imported subcomponents and paths against the actual aliases. Correct defects in the requested addition without redesigning unrelated UI.
