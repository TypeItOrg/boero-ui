"use client";

import * as React from "react";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";
import { useRouter } from "next/navigation";
import { EnrollmentStartSelector } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import { startOrGetEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import type { EnrollmentStartStudyPlanOption } from "@features/enrollment-applications/components/EnrollmentStartSelector";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

interface EnrollmentStartProps {
  studyPlans: EnrollmentStartStudyPlanOption[];
  periods?: EnrollmentPeriod[];
  studyPlanPagination?: React.ReactNode;
}

type EnrollmentStartState = {
  error?: string;
};

export function EnrollmentStart({ studyPlans, studyPlanPagination }: EnrollmentStartProps): React.ReactElement {
  const router = useRouter();
  const [state, startApplication, isStarting] = React.useActionState(
    async (_previous: EnrollmentStartState, input: StartEnrollmentApplicationInput): Promise<EnrollmentStartState> => {
      const result = await startOrGetEnrollmentApplicationAction(input);

      if ("error" in result) {
        return { error: result.error };
      }

      router.push(`/my-enrollment-applications/${result.application.applicationId}`);

      return {};
    },
    {},
  );

  function handleStart(input: StartEnrollmentApplicationInput): void {
    React.startTransition(() => startApplication(input));
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
