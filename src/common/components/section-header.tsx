import type { ReactElement, ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { cn } from "@common/utils/cn.util";

type SectionHeaderProps = {
  action?: ReactNode;
  actionClassName?: string;
  compactDescription?: ReactNode;
  compactTitle?: ReactNode;
  description: ReactNode;
  descriptionBreakpoint?: "sm" | "xl";
  icon: LucideIcon;
  title: ReactNode;
  titleClassName?: string;
  titleId?: string;
};

export function SectionHeader({
  action,
  actionClassName,
  compactDescription,
  compactTitle,
  description,
  descriptionBreakpoint = "xl",
  icon: Icon,
  title,
  titleClassName,
  titleId,
}: SectionHeaderProps): ReactElement {
  return (
    <div data-slot="section-header" className="@container/section-header w-full min-w-0">
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 @xl/section-header:gap-x-3.5",
          descriptionBreakpoint === "sm" ? "@sm/section-header:gap-y-0.5" : "@xl/section-header:gap-y-0.5",
          action && "@xl/section-header:grid-cols-[auto_minmax(0,1fr)_auto]",
        )}
      >
        <div
          className={cn(
            "bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl",
            descriptionBreakpoint === "sm"
              ? "@sm/section-header:row-span-2 @sm/section-header:size-11"
              : "@xl/section-header:row-span-2 @xl/section-header:size-11",
          )}
        >
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <h2 id={titleId} className={cn("min-w-0 text-base leading-snug font-semibold break-words", titleClassName)}>
          {compactTitle ? (
            <>
              <span className="@xl/section-header:hidden">{compactTitle}</span>
              <span className="hidden @xl/section-header:inline">{title}</span>
            </>
          ) : (
            title
          )}
        </h2>
        <p
          className={cn(
            "text-muted-foreground col-span-2 text-sm leading-relaxed break-words",
            descriptionBreakpoint === "sm"
              ? "@sm/section-header:col-span-1 @sm/section-header:col-start-2 @sm/section-header:leading-normal"
              : "@xl/section-header:col-span-1 @xl/section-header:col-start-2 @xl/section-header:leading-normal",
          )}
        >
          {compactDescription ? (
            <>
              <span className="@xl/section-header:hidden">{compactDescription}</span>
              <span className="hidden @xl/section-header:inline">{description}</span>
            </>
          ) : (
            description
          )}
        </p>
        {action ? (
          <div
            className={cn(
              "col-span-2 mt-2 min-w-0 @xl/section-header:col-span-1 @xl/section-header:col-start-3 @xl/section-header:row-span-2 @xl/section-header:row-start-1 @xl/section-header:mt-0 @xl/section-header:justify-self-end",
              actionClassName,
            )}
          >
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}
