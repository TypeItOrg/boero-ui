"use client";

import { useCallback, type ComponentProps, type ReactElement } from "react";

type ActionFormProps = Omit<ComponentProps<"form">, "onResetCapture"> & {
  resetOnSuccess?: boolean;
};

export function ActionForm({ resetOnSuccess = false, ref, ...props }: ActionFormProps): ReactElement {
  const attachForm = useCallback(
    (element: HTMLFormElement | null) => {
      if (!element) {
        return;
      }

      const form = element;

      function preserveValues(event: Event): void {
        // React disables synthetic events during its action reset. Read the committed
        // DOM attribute so this native listener uses the current action result.
        if (form.dataset.resetOnSuccess !== "true") {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }

      form.addEventListener("reset", preserveValues, true);

      const refCleanup = typeof ref === "function" ? ref(form) : undefined;

      if (ref && typeof ref !== "function") {
        ref.current = form;
      }

      return () => {
        form.removeEventListener("reset", preserveValues, true);

        if (typeof refCleanup === "function") {
          refCleanup();
        } else if (typeof ref === "function") {
          ref(null);
        } else if (ref) {
          ref.current = null;
        }
      };
    },
    [ref],
  );

  return <form {...props} ref={attachForm} data-reset-on-success={resetOnSuccess} />;
}
