import type { ReactElement, ReactNode } from "react";

import type { LucideIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { CardHeader } from "@common/components/ui/card";

type EnrollmentStepCardHeaderProps = {
  action?: ReactNode;
  actionClassName?: string;
  description: ReactNode;
  descriptionBreakpoint?: "sm" | "xl";
  icon: LucideIcon;
  title: ReactNode;
  titleId?: string;
};

export function EnrollmentStepCardHeader({
  action,
  actionClassName,
  description,
  descriptionBreakpoint,
  icon: Icon,
  title,
  titleId,
}: EnrollmentStepCardHeaderProps): ReactElement {
  return (
    <CardHeader className="block border-b">
      <SectionHeader
        action={action}
        actionClassName={actionClassName}
        description={description}
        descriptionBreakpoint={descriptionBreakpoint}
        icon={Icon}
        title={title}
        titleId={titleId}
      />
    </CardHeader>
  );
}
