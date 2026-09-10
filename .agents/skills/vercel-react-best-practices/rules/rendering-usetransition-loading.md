---
title: Match Pending State to the Operation Owner
impact: LOW
impactDescription: preserves action and query state ownership
tags: rendering, transitions, useActionState, loading, state
---

## Match Pending State to the Operation Owner

In Boero UI, Server Action forms and confirmation dialogs use `useActionState`. Client-owned cached mutations use the existing Query mutation state. Do not introduce another loading flag or migrate either workflow merely to use `useTransition`.

Use transitions for non-urgent rendering work when the component owns that work and no existing action/query state already represents it. Keep controlled input updates urgent.

A transition is not request cancellation or protection against stale network results. Handle cancellation/ordering in the data layer. Async state updates after an await may require another transition; consult the installed React API when implementing that path.

Reference: [React useTransition](https://react.dev/reference/react/useTransition).
