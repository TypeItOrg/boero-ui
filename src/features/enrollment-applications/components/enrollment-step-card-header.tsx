import type { LucideIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { CardHeader } from "@common/components/ui/card";

type EnrollmentStepCardHeaderProps = {
  action?: React.ReactNode;
  description: React.ReactNode;
  icon: LucideIcon;
  title: React.ReactNode;
};

export function EnrollmentStepCardHeader({ action, description, icon: Icon, title }: EnrollmentStepCardHeaderProps): React.ReactElement {
  return (
    <CardHeader className="block border-b">
      <SectionHeader action={action} description={description} icon={Icon} title={title} />
    </CardHeader>
  );
}
