"use client";

import { useEffect, useRef } from "react";

export function useActionFormErrorFocus(state: { error?: string; fieldErrors?: Record<string, unknown> }, pending: boolean) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (pending) {
      return;
    }

    const hasErrors = Boolean(state.error) || Object.keys(state.fieldErrors ?? {}).length > 0;

    if (!hasErrors) {
      return;
    }

    const invalidControl = formRef.current?.querySelector<HTMLElement>(
      'input[aria-invalid="true"]:not([type="hidden"]):not([disabled]), button[aria-invalid="true"]:not([disabled]), select[aria-invalid="true"]:not([disabled]), textarea[aria-invalid="true"]:not([disabled]), [data-invalid="true"] input:not([type="hidden"]):not([disabled]), [data-invalid="true"] button:not([disabled]), [data-invalid="true"] select:not([disabled]), [data-invalid="true"] textarea:not([disabled])',
    );

    if (invalidControl) {
      invalidControl.scrollIntoView({ block: "center" });
      invalidControl.focus({ preventScroll: true });

      return;
    }

    const fallbackAlert = formRef.current?.querySelector<HTMLElement>('[role="alert"].text-destructive, [role="alert"]');

    if (fallbackAlert) {
      fallbackAlert.tabIndex = -1;
      fallbackAlert.scrollIntoView({ block: "center" });
      fallbackAlert.focus({ preventScroll: true });
    }
  }, [state, pending]);

  return formRef;
}
