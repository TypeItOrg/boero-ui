---
name: shadcn
description: Add or update shadcn registry components, inspect presets, or resolve component API questions not answered by installed source.
---

# shadcn in Boero UI

Use `components.json`, installed component source and `package.json` to resolve the aliases, primitive family and version relevant to the task.

Use existing components and variants. Preserve local design and accessibility contracts; styling examples are defaults, not a reason to override a requested design. For routine local edits, resolve the issue from installed source without registry search or installation.

Choose only the needed reference:
- Adding/updating components: [component workflow](references/components.md).
- Switching presets: [preset workflow](references/presets.md).
- Unclear CLI options: [CLI reference](cli.md); verify against the installed CLI's help.
- Component composition: [forms](rules/forms.md), [composition](rules/composition.md), [Radix versus Base](rules/base-vs-radix.md).
- Design details: [styling](rules/styling.md), [icons](rules/icons.md), [theming](customization.md).
- Requested registry authoring: [registries](registry.md).

Use the repository's package manager and installed shadcn CLI first (`pnpm exec shadcn`). Fetch documentation or use a newer CLI only when the task requires information or capabilities not available locally. A newer example does not authorize upgrading dependencies.

Reuse an established registry or the user's explicit choice. Ask only when multiple plausible choices materially change the result. Complete the authorized update and relevant verification without asking again for a strategy the user already selected; preserve custom behavior unless replacement of the affected files is explicit.
