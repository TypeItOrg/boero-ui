import * as React from "react";

import { cn } from "@common/utils/cn.util";

type PlatformPageShellProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  children?: React.ReactNode;
  minViewportHeight?: boolean;
  breadcrumb?: React.ReactNode;
  contentVariant?: "surface" | "plain";
  headerClassName?: string;
};

export function PlatformPageShell({
  title,
  description,
  actions,
  children,
  minViewportHeight = false,
  breadcrumb,
  contentVariant = "surface",
  headerClassName,
}: PlatformPageShellProps): React.ReactElement {
  return (
    <section
      className={cn("flex h-full max-w-full min-w-0 flex-col gap-4 p-4", minViewportHeight && "min-h-full flex-1")}
    >
      <header
        className={cn(
          "bg-background flex min-w-0 flex-col gap-4 rounded-xl p-5 shadow-xs sm:p-6 md:flex-row md:items-end md:justify-between",
          headerClassName,
        )}
      >
        <div className="flex min-w-0 flex-col gap-2">
          {breadcrumb ? <div>{breadcrumb}</div> : null}
          <div>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
            {description ? <p className="text-muted-foreground mt-1 line-clamp-1 text-sm">{description}</p> : null}
          </div>
        </div>
        {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
      </header>

      {children ? (
        <div
          className={cn(
            "flex h-full min-w-0 flex-col gap-5",
            contentVariant === "surface" && "bg-background rounded-xl p-5 shadow-xs sm:p-6",
            minViewportHeight && "flex-1",
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
