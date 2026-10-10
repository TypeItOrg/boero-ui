"use client";

import type { ReactElement } from "react";

import { BanIcon, CheckCircle2Icon, ClockIcon, XCircleIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";

import { ENROLLMENT_APPLICATION_STATUS_LABELS } from "@features/enrollment-applications/constants/enrollment-application.constants";
import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";

export function getStatusBadge(status: EnrollmentApplicationStatus): ReactElement {
  if (status === ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED) {
    return (
      <Badge size="lg" variant="outline">
        Admitida provisoriamente
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.SUBMITTED) {
    return (
      <Badge size="lg" variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
        <ClockIcon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.SUBMITTED}
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.APPROVED) {
    return (
      <Badge size="lg" variant="success">
        <CheckCircle2Icon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.APPROVED}
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.REJECTED) {
    return (
      <Badge size="lg" variant="destructive">
        <XCircleIcon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.REJECTED}
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.CANCELLED) {
    return (
      <Badge size="lg" variant="outline" className="text-muted-foreground">
        <BanIcon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.CANCELLED}
      </Badge>
    );
  }

  return (
    <Badge size="lg" variant="outline">
      {ENROLLMENT_APPLICATION_STATUS_LABELS.DRAFT}
    </Badge>
  );
}
