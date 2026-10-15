"use client";

import { startTransition, useActionState, type ReactElement, type ReactNode } from "react";

import { useRouter } from "next/navigation";

import { startOrGetEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import { EnrollmentStartSelector } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import type { EnrollmentStartStudyPlanOption } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

interface EnrollmentStartProps {
  /** Dependent the application is for; omit to enroll the signed-in user. */
  applicantPersonId?: string;
  studyPlans: EnrollmentStartStudyPlanOption[];
  periods?: EnrollmentPeriod[];
  studyPlanPagination?: ReactNode;
}

type EnrollmentStartState = {
  error?: string;
};

export function EnrollmentStart({ applicantPersonId, studyPlans, studyPlanPagination }: EnrollmentStartProps): ReactElement {
  const router = useRouter();

  const [state, startApplication, isStarting] = useActionState(
    async (_previous: EnrollmentStartState, input: StartEnrollmentApplicationInput): Promise<EnrollmentStartState> => {
      const result = await startOrGetEnrollmentApplicationAction(applicantPersonId ? { ...input, applicantPersonId } : input);

      if ("error" in result) {
        return { error: result.error };
      }

      router.push(`/my-enrollment-applications/${result.application.applicationId}`);

      return {};
    },
    {},
  );

  function handleStart(input: StartEnrollmentApplicationInput): void {
    startTransition(() => startApplication(input));
  }

  return (
    <EnrollmentStartSelector
      studyPlans={studyPlans.map((plan) => ({ id: plan.id, name: plan.name, trainingPathName: plan.trainingPathName }))}
      studyPlanPagination={studyPlanPagination}
      error={state.error}
      isStarting={isStarting}
      onStart={handleStart}
    />
  );
}
