import type { ReactElement, ReactNode } from "react";

import { cn } from "@common/utils/cn.util";

export function PlatformCollectionActions({ children, className }: { children?: ReactNode; className?: string }): ReactElement | null {
  if (!children) {
    return null;
  }

  return <div className={cn("flex shrink-0 flex-col gap-2 sm:flex-row sm:justify-end [&>*]:w-full sm:[&>*]:w-auto", className)}>{children}</div>;
}
