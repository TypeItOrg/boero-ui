import type { LucideIcon } from "lucide-react";

import { CardAction, CardDescription, CardHeader, CardTitle } from "@common/components/ui/card";

type EnrollmentStepCardHeaderProps = {
  action?: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  title: React.ReactNode;
};

export function EnrollmentStepCardHeader({ action, description, icon: Icon, title }: EnrollmentStepCardHeaderProps): React.ReactElement {
  return (
    <CardHeader className="border-b">
      <div className="flex items-stretch gap-3.5">
        <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col justify-center">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </div>
      {action ? <CardAction>{action}</CardAction> : null}
    </CardHeader>
  );
}
