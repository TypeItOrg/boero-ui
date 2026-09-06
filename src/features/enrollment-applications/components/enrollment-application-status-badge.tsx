import { Badge } from "@common/components/ui/badge";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { getEnrollmentApplicationStatusLabel } from "../utils/enrollment-application-status.util";

type EnrollmentApplicationStatusBadgeProps = {
  status: EnrollmentApplicationStatus;
};

export function EnrollmentApplicationStatusBadge({ status }: EnrollmentApplicationStatusBadgeProps): React.ReactElement {
  return <Badge variant={getStatusVariant(status)}>{getEnrollmentApplicationStatusLabel(status)}</Badge>;
}

function getStatusVariant(status: EnrollmentApplicationStatus): "secondary" | "success" | "destructive" | "outline" {
  if (status === "SUBMITTED") return "secondary";
  if (status === "APPROVED") return "success";
  if (status === "REJECTED") return "destructive";
  return "outline";
}
