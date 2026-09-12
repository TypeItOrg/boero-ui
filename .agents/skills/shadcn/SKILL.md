---
name: shadcn
description: Add or update shadcn registry components, inspect presets, or resolve component API questions not answered by installed source.
---

# shadcn in Boero UI

Inspect `components.json`, the installed component source and `package.json` when they matter to the task. Do not assume shell output was injected into this document.

Use existing components and variants. Preserve local design and accessibility contracts; styling examples are defaults, not a reason to override a requested design. For routine local edits, resolve the issue from installed source without registry search or installation.

Choose only the needed reference:
- Adding/updating components: [component workflow](references/components.md).
- Switching presets: [preset workflow](references/presets.md).
- Unclear CLI options: [CLI reference](cli.md); verify against the installed CLI's help.
- Component composition: [forms](rules/forms.md), [composition](rules/composition.md), [Radix versus Base](rules/base-vs-radix.md).
- Design details: [styling](rules/styling.md), [icons](rules/icons.md), [theming](customization.md).
- Requested registry authoring: [registries](registry.md).

Use the repository's package manager and installed shadcn CLI first (`pnpm exec shadcn`). Fetch documentation or use a newer CLI only when the task requires information or capabilities not available locally. A newer example does not authorize upgrading dependencies.

Reuse an established registry or the user's explicit choice. Ask only when multiple plausible choices materially change the result. Preserve existing authorization: do not ask again for an update strategy the user already selected.

## Updating components

Preview affected files with the supported dry-run/diff options. Merge requested upstream changes into local source, preserving custom behavior. Overwrite only files covered by an explicit overwrite instruction; approval for one component is not approval for all installed components. Complete the selected update and relevant verification within scope.
