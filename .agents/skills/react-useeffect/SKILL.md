---
name: react-useeffect
description: Diagnose effect loops, stale closures, cleanup failures and unnecessary derived state in React.
---

# Effects and state

For a reported effect problem, identify the external system being synchronized and the values that should resynchronize it. Derive values during render when possible; handle user-triggered actions in their event handlers. Use keyed remounting only when resetting all state for that identity is intended.

Keep subscriptions and asynchronous results tied to their lifecycle. Cleanup should unsubscribe, cancel or ignore obsolete results as appropriate. A Strict Mode replay should remain correct; a run-once flag must not hide missing cleanup.

In Boero UI, browser catalog reads use the existing Query-backed components and bounded Route Handlers. Server Action forms use `useActionState`. Do not replace either flow with a manual fetching effect.

For an effect-specific issue, consult only the relevant official explanation:
- [Unnecessary effects and derived state](https://react.dev/learn/you-might-not-need-an-effect).
- [Effect lifecycle and cleanup](https://react.dev/learn/synchronizing-with-effects).
- [Effect Events](https://react.dev/reference/react/useEffectEvent): keep reactive dependencies; Effect Events are not general stable callbacks and do not have stable identity.

Avoid a broader effect rewrite or memoization pass when a focused fix satisfies the request.
