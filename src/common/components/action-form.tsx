"use client";

import type { ComponentProps } from "react";

type ActionFormProps = Omit<ComponentProps<"form">, "onResetCapture"> & {
  resetOnSuccess?: boolean;
};

export function ActionForm({ resetOnSuccess = false, ...props }: ActionFormProps): React.ReactElement {
  return (
    <form
      {...props}
      onResetCapture={(event) => {
        // React resets action forms even when the action returns validation errors.
        // Capture also protects date/time controls with native reset listeners.
        if (!resetOnSuccess) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
    />
  );
}
