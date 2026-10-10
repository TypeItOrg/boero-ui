import type { ReactElement, ReactNode } from "react";

import { cn } from "@common/utils/cn.util";

type PlatformPageShellProps = {
  title: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  minViewportHeight?: boolean;
  breadcrumb?: ReactNode;
  contentVariant?: "surface" | "plain";
  headerClassName?: string;
  actionsClassName?: string;
};

export function PlatformPageShell({
  title,
  actions,
  children,
  minViewportHeight = false,
  breadcrumb,
  contentVariant = "surface",
  headerClassName,
  actionsClassName,
}: PlatformPageShellProps): ReactElement {
  return (
    <section
      className={cn("@container/page-shell flex h-full max-w-full min-w-0 flex-col gap-4 p-3 md:p-4", minViewportHeight && "min-h-full flex-1")}
    >
      <header
        className={cn(
          headerClassName,
          "bg-background flex min-w-0 flex-col gap-4 rounded-xl p-4 shadow-xs @md/page-shell:p-6 @2xl/page-shell:flex-row @2xl/page-shell:items-center @2xl/page-shell:justify-between",
        )}
      >
        <div className="flex w-full min-w-0 flex-1 flex-col gap-1">
          {breadcrumb ? <div className="max-w-full min-w-0">{breadcrumb}</div> : null}
          <div className="min-w-0">
            <h1 className="text-foreground text-xl font-semibold tracking-tight break-words @md/page-shell:text-2xl @2xl/page-shell:text-3xl">
              {title}
            </h1>
          </div>
        </div>
        {actions ? (
          <div
            className={cn(
              "flex shrink-0 items-center gap-3 has-data-[slot=platform-page-icon]:hidden @2xl/page-shell:self-stretch @2xl/page-shell:has-data-[slot=platform-page-icon]:flex",
              actionsClassName,
            )}
          >
            {actions}
          </div>
        ) : null}
      </header>

      {children ? (
        <div
          className={cn(
            "flex h-full min-w-0 flex-col gap-4",
            contentVariant === "surface" && "bg-background rounded-xl p-4 shadow-xs sm:p-6",
            minViewportHeight && "flex-1",
          )}
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}
