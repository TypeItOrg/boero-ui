"use client";

import { isValidElement, type ComponentType, type ReactElement, type ReactNode } from "react";

import { CircleAlertIcon, RefreshCwIcon, SearchIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Skeleton } from "@common/components/ui/skeleton";
import { cn } from "@common/utils/cn.util";

export function LoadingState({ itemSize }: { itemSize: number }): ReactElement {
  return (
    <div className="flex w-full flex-col gap-1 p-1">
      <LoadingInitialRow itemSize={itemSize} className="mt-1" />
    </div>
  );
}

export function ErrorState({ message, retry }: { message: string; retry: () => void }): ReactElement {
  return (
    <div className="p-2" role="alert">
      <div className="bg-muted/50 flex min-h-32 flex-col items-center justify-center gap-3 rounded-lg border px-4 py-5 text-center">
        <div className="bg-destructive/10 text-destructive flex size-9 items-center justify-center rounded-full">
          <CircleAlertIcon className="size-4" />
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
        <Button onClick={retry} size="sm" type="button" variant="outline">
          <RefreshCwIcon data-icon="inline-start" />
          Reintentar
        </Button>
      </div>
    </div>
  );
}

export function DropdownEmptyState({
  icon: Icon,
  title,
}: {
  description?: string;
  icon?: ComponentType<{ className?: string }> | ReactNode;
  title: string;
}): ReactElement {
  let iconElement: ReactNode = null;

  if (isValidElement(Icon)) {
    iconElement = Icon;
  } else if (typeof Icon === "function") {
    const IconComponent = Icon;
    iconElement = <IconComponent className="size-4.5" aria-hidden="true" />;
  } else {
    iconElement = <SearchIcon className="size-4.5" aria-hidden="true" />;
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <div className="bg-background border-border/60 text-muted-foreground flex size-9 items-center justify-center rounded-full border shadow-xs">
        {iconElement}
      </div>
      <p className="text-foreground text-sm font-medium">{title}</p>
    </div>
  );
}

export function LoadingInitialRow({ className, itemSize }: { className?: string; itemSize: number }): ReactElement {
  return (
    <div className={cn("flex w-full items-center", className)} style={{ height: itemSize }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}

export function LoadingSkeletonRow({ itemSize }: { itemSize: number }): ReactElement {
  return (
    <div className="flex w-full items-center px-2" style={{ height: itemSize }}>
      <Skeleton className="h-full w-full" />
    </div>
  );
}
