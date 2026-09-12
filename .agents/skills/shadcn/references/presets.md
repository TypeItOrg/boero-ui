# Preset changes

Use this reference only when the requested task changes a preset. A component edit is not a preset migration.

Inspect the current preset/config and the incoming preset using CLI-supported commands. Treat preset codes as opaque; do not invent URLs or decode them manually. Use the installed CLI's help when command availability differs from the reference.

Choose the strategy from the user's request and the inspected diff:
- Full replacement: apply the requested preset only over the authorized targets.
- Theme/font-only: use supported partial application flags.
- Preserve components: merge changes into customized files.
- No preset change: do not execute init/apply commands.

An instruction to skip is not permission to run init or change CSS/config. Do not repeat a strategy question the user already answered. If the strategy is unclear and replacement would discard custom work, show the affected files and ask only for that unresolved decision.

Run project-aware commands in the project directory. Preserve its primitive family and aliases; if an isolated comparison is needed, match those settings explicitly. Preview mutation commands before applying them and verify the selected result.
