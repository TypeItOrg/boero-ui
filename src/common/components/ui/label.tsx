"use client";

import type { ComponentProps, MouseEvent } from "react";

import { cn } from "@common/utils/cn.util";

function Label({ className, onClick, ...props }: ComponentProps<"label">) {
  const handleClick = (event: MouseEvent<HTMLLabelElement>) => {
    onClick?.(event);

    if (event.defaultPrevented) {
      return;
    }

    const target = event.target;

    if (target instanceof Element && target.closest('a[href], button, input, select, textarea, [contenteditable="true"]')) {
      return;
    }

    const control = event.currentTarget.control;

    if (!control || control.matches('input[type="checkbox"], input[type="radio"], [role="checkbox"], [role="radio"], [role="switch"]')) {
      return;
    }

    // Selecting label text must not focus an input or open its associated picker.
    event.preventDefault();
  };

  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-text group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
      onClick={handleClick}
    />
  );
}

export { Label };
