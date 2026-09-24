"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { EnrollmentStartSelector } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import { startOrGetEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import type { EnrollmentStartStudyPlanOption } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

interface EnrollmentStartProps {
  /** Dependent the application is for; omit to enroll the signed-in user. */
  applicantPersonId?: string;
  studyPlans: EnrollmentStartStudyPlanOption[];
  periods: EnrollmentPeriod[];
  allExcludedByActiveApplication?: boolean;
  studyPlanPagination?: React.ReactNode;
  periodPagination?: React.ReactNode;
}

type EnrollmentStartState = {
  error?: string;
};

export function EnrollmentStart({
  applicantPersonId,
  studyPlans,
  periods,
  allExcludedByActiveApplication = false,
  studyPlanPagination,
  periodPagination,
}: EnrollmentStartProps): React.ReactElement {
  const router = useRouter();
  const [state, startApplication, isStarting] = React.useActionState(
    async (_previous: EnrollmentStartState, input: { studyPlanId: string; academicYearId: string }): Promise<EnrollmentStartState> => {
      const result = await startOrGetEnrollmentApplicationAction(applicantPersonId ? { ...input, applicantPersonId } : input);

      if ("error" in result) {
        return { error: result.error };
      }

      router.push(`/my-enrollment-applications/${result.application.applicationId}`);

      return {};
    },
    {},
  );

  function handleStart(input: { studyPlanId: string; academicYearId: string }): void {
    React.startTransition(() => startApplication(input));
  }

  return (
    <EnrollmentStartSelector
      studyPlans={studyPlans.map((plan) => ({ id: plan.id, name: plan.name, trainingPathName: plan.trainingPathName }))}
      periods={periods.map((period) => ({
        id: period.id,
        academicYearId: period.academicYearId,
        academicYearNumber: period.academicYearNumber,
        name: period.name,
      }))}
      studyPlanPagination={studyPlanPagination}
      periodPagination={periodPagination}
      error={state.error}
      isStarting={isStarting}
      onStart={handleStart}
      allExcludedByActiveApplication={allExcludedByActiveApplication}
    />
  );
}
