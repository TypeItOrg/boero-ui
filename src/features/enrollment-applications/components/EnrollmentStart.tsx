"use client";

import * as React from "react";
import { EnrollmentStartSelector } from "./EnrollmentStartSelector";
import { EnrollmentWizard } from "./EnrollmentWizard";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

interface EnrollmentStartProps {
  studyPlans: StudyPlan[];
  periods: EnrollmentPeriod[];
}

export function EnrollmentStart({ studyPlans, periods }: EnrollmentStartProps): React.ReactElement {
  const [selection, setSelection] = React.useState<{ studyPlanId: string; academicYearId: string } | null>(null);

  if (selection) {
    return <EnrollmentWizard studyPlanId={selection.studyPlanId} academicYearId={selection.academicYearId} />;
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
      onStart={setSelection}
    />
  );
}
