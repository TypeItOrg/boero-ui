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
      <NavigationLinkContent label={pendingLabel} variant={pendingVariant}>
        {children}
      </NavigationLinkContent>
    </Link>
  );
}

function NavigationLinkContent({
  children,
  label,
  variant,
}: {
  children: React.ReactNode;
  label: string;
  variant: "pulse" | "spinner";
}): React.ReactElement {
  const { pending } = useLinkStatus();

  if (variant === "pulse") {
    return (
      <>
        {children}
        <NavigationPendingOverlay label={label} pending={pending} variant={variant} />
      </>
    );
  }

  return (
    <>
      <span className={cn("inline-flex min-w-0 items-center gap-[inherit]", pending && "invisible")}>{children}</span>
      <NavigationPendingOverlay label={label} pending={pending} variant={variant} />
    </>
  );
}

function NavigationPendingOverlay({
  label,
  pending,
  variant,
}: {
  label: string;
  pending: boolean;
  variant: "pulse" | "spinner";
}): React.ReactElement {
  return (
    <span
      aria-busy={pending}
      className={cn("pointer-events-none absolute inset-0 flex items-center justify-center", !pending && "invisible")}
      data-navigation-pending={pending ? "true" : "false"}
      data-pending-variant={variant}
    >
      {variant === "spinner" ? (
        <Loader2Icon aria-hidden="true" className="animate-spin motion-reduce:animate-none" />
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {pending ? label : ""}
      </span>
    </span>
  );
}

export { NavigationLink };
export type { NavigationLinkProps };
