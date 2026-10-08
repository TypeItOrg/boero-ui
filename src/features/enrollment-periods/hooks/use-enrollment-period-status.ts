"use client";

import { startTransition, useActionState } from "react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { updateEnrollmentPeriodStatusAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import { type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";

export function useEnrollmentPeriodStatus(institutionId: string, scope: AcademicScope) {
  const router = useRouter();

  const [, changeStatus, isChangingStatus] = useActionState(
    async (_previous: EnrollmentPeriodActionState, input: { periodId: string; status: EnrollmentPeriodStatus }) => {
      const result = await updateEnrollmentPeriodStatusAction(institutionId, input.periodId, { status: input.status }, scope);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(ENROLLMENT_MESSAGES.PERIOD_STATUS_UPDATED);
        router.refresh();
      }

      return result;
    },
    {},
  );

  const handleStatusChange = (periodId: string, status: EnrollmentPeriodStatus) => startTransition(() => changeStatus({ periodId, status }));

  return { isChangingStatus, handleStatusChange };
}
