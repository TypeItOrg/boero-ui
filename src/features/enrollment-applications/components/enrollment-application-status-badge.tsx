import { Badge } from "@common/components/ui/badge";
import { cn } from "@common/utils/cn.util";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { getEnrollmentApplicationStatusLabel } from "../utils/enrollment-application-status.util";

type EnrollmentApplicationStatusBadgeProps = {
  status: EnrollmentApplicationStatus;
};

const STATUS_CLASSNAMES: Record<EnrollmentApplicationStatus, string> = {
  DRAFT: "border-border text-foreground",
  SUBMITTED: "bg-amber-500/15 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30",
  APPROVED: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30",
  REJECTED: "bg-destructive/10 text-destructive dark:bg-destructive/20",
  CANCELLED: "bg-muted text-muted-foreground border-border",
};

export function EnrollmentApplicationStatusBadge({ status }: EnrollmentApplicationStatusBadgeProps): React.ReactElement {
  return (
    <Badge variant="outline" className={cn(STATUS_CLASSNAMES[status])}>
      {getEnrollmentApplicationStatusLabel(status)}
    </Badge>
  );
}
