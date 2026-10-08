"use client";

import { useEffect, useRef } from "react";

export function useActionFormErrorFocus(state: { error?: string; fieldErrors?: Record<string, unknown> }, pending: boolean) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && (state.error || Object.keys(state.fieldErrors ?? {}).length > 0)) {
      const error = formRef.current?.querySelector<HTMLElement>('[data-slot="field-error"], [role="alert"].text-destructive');

      if (error) {
        error.tabIndex = -1;
        error.scrollIntoView({ block: "center" });
        error.focus({ preventScroll: true });
      }
    }
  }, [state, pending]);

  return formRef;
}
