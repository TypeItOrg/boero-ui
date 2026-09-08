import * as React from "react";
import { Badge } from "@common/components/ui/badge";
import { ENROLLMENT_APPLICATION_STATUS_LABELS, ENROLLMENT_APPLICATION_STATUS_VARIANTS } from "../constants/enrollment-application.constants";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application.types";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentApplicationStatus;
  size?: "default" | "lg";
  className?: string;
}

export function EnrollmentStatusBadge({ status, size = "default", className }: EnrollmentStatusBadgeProps): React.ReactElement {
  const variant = ENROLLMENT_APPLICATION_STATUS_VARIANTS[status] ?? "secondary";
  const label = ENROLLMENT_APPLICATION_STATUS_LABELS[status] ?? status;

  return (
    <Badge variant={variant} size={size} className={className}>
      {label}
    </Badge>
  );
}
