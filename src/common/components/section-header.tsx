import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@common/utils/cn.util";

type SectionHeaderProps = {
  action?: ReactNode;
  compactDescription?: ReactNode;
  compactTitle?: ReactNode;
  description: ReactNode;
  icon: LucideIcon;
  title: ReactNode;
  titleClassName?: string;
  titleId?: string;
};

export function SectionHeader({
  action,
  compactDescription,
  compactTitle,
  description,
  icon: Icon,
  title,
  titleClassName,
  titleId,
}: SectionHeaderProps): React.ReactElement {
  return (
    <div data-slot="section-header" className="@container/section-header w-full min-w-0">
      <div
        className={cn(
          "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-2 @xl/section-header:gap-x-3.5 @xl/section-header:gap-y-1",
          action && "@xl/section-header:grid-cols-[auto_minmax(0,1fr)_auto]",
        )}
      >
        <div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-xl @xl/section-header:row-span-2 @xl/section-header:size-11">
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
        <p className="text-muted-foreground col-span-2 text-sm leading-relaxed break-words @xl/section-header:col-span-1 @xl/section-header:col-start-2 @xl/section-header:leading-normal">
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
          <div className="col-span-2 mt-2 min-w-0 @xl/section-header:col-span-1 @xl/section-header:col-start-3 @xl/section-header:row-span-2 @xl/section-header:row-start-1 @xl/section-header:mt-0 @xl/section-header:justify-self-end">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}
