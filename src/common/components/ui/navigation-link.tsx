"use client";

import * as React from "react";
import Link, { useLinkStatus } from "next/link";
import { Loader2Icon } from "lucide-react";

import { cn } from "@common/utils/cn.util";

type NavigationLinkProps = React.ComponentProps<typeof Link> & {
  disabled?: boolean;
  pendingLabel?: string;
  pendingVariant?: "pulse" | "spinner";
};

function NavigationLink({
  children,
  className,
  disabled = false,
  onClick,
  pendingLabel = "Navegando",
  pendingVariant = "spinner",
  tabIndex,
  ...props
}: NavigationLinkProps): React.ReactElement {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>): void {
    if (disabled) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  }

  return (
    <Link
      aria-disabled={disabled || undefined}
      className={cn(
        "navigation-link group/navigation-link relative",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      onClick={handleClick}
      tabIndex={disabled ? -1 : tabIndex}
      {...props}
    >
      {children}
      <NavigationPendingIndicator label={pendingLabel} variant={pendingVariant} />
    </Link>
  );
}

function NavigationPendingIndicator({
  label,
  variant,
}: {
  label: string;
  variant: "pulse" | "spinner";
}): React.ReactElement {
  const { pending } = useLinkStatus();

  return (
    <span
      aria-busy={pending}
      className="navigation-pending-overlay"
      data-navigation-pending={pending ? "true" : "false"}
      data-pending-variant={variant}
    >
      {variant === "spinner" ? (
        <Loader2Icon
          aria-hidden="true"
          className={cn("size-4", pending ? "navigation-pending-indicator" : "opacity-0")}
        />
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? label : ""}
      </span>
    </span>
  );
}

export { NavigationLink };
export type { NavigationLinkProps };
