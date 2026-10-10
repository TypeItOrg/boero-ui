"use client";

import type { PropsWithChildren, ReactElement, ReactNode } from "react";

import { type LucideIcon } from "lucide-react";

import { Skeleton } from "@common/components/ui/skeleton";
import { cn } from "@common/utils/cn.util";

const SEARCH_SKELETON_ROWS = [0] as const;

export function SearchMessage({ action, compact = false, icon: Icon, role = "status", title, children }: SearchMessageProps): ReactElement {
  return (
    <div
      role={role}
      aria-live={role === "alert" ? "assertive" : "polite"}
      className={cn(
        "text-muted-foreground flex flex-col items-center gap-2 px-5 text-center text-sm",
        compact ? "py-4" : "py-9 max-sm:min-h-[calc(min(78dvh,42rem)-3.5rem)] max-sm:justify-center",
      )}
    >
      <span className="bg-muted flex size-9 items-center justify-center rounded-full">
        <Icon className="size-4" />
      </span>
      <div className="flex flex-col gap-1">
        {title ? <p className="text-foreground font-medium">{title}</p> : null}
        <span>{children}</span>
        {action ? <div className="pt-1.5">{action}</div> : null}
      </div>
    </div>
  );
}

export type SearchMessageProps = PropsWithChildren<{
  action?: ReactNode;
  compact?: boolean;
  icon: LucideIcon;
  role?: "alert" | "status";
  title?: string;
}>;

export function SearchSkeleton(): ReactElement {
  return (
    <div role="status" aria-live="polite" aria-label="Buscando resultados" className="flex flex-col gap-2 px-3 pt-2.5 pb-2.5 sm:px-4">
      <Skeleton className="bg-muted-foreground/15 h-3 w-16" />
      {SEARCH_SKELETON_ROWS.map((item) => (
        <div key={item} className="bg-muted flex h-13.5 items-stretch gap-3 rounded-lg px-2 py-1.5">
          <Skeleton className="bg-muted-foreground/10 h-auto min-h-8 w-8 shrink-0 rounded-lg" />
          <Skeleton className="bg-muted-foreground/10 size-full" />
        </div>
      ))}
    </div>
  );
}
