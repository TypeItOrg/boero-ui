import * as React from "react";

import { ActiveAcademicStatusDialog } from "@features/academic/components/active-academic-status-dialog";
import { AcademicYearStatusDialog } from "@features/academic/components/academic-year-status-dialog";
import { CourseStatusDialog } from "@features/academic/components/course-status-dialog";
import { StudyPlanStatusDialog } from "@features/academic/components/study-plan-status-dialog";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicStatusSelection } from "@features/academic/types/academic-status-selection.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicStatusDialogRouterProps = {
  institutionId: string;
  onOpenChange: (open: boolean) => void;
  returnTo: string;
  scope: AcademicScope;
  selection: AcademicStatusSelection;
};

export function AcademicStatusDialogRouter({
  institutionId,
  onOpenChange,
  returnTo,
  scope,
  selection,
}: AcademicStatusDialogRouterProps): React.ReactElement {
  if (selection.resource === AcademicResource.ACADEMIC_YEAR) {
    return (
      <AcademicYearStatusDialog
        academicYearLabel={selection.academicYearLabel}
        id={selection.id}
        institutionId={institutionId}
        onOpenChange={onOpenChange}
        open
        returnTo={returnTo}
        scope={scope}
        targetStatus={selection.targetStatus}
      />
    );
  }

  if (selection.resource === AcademicResource.STUDY_PLAN) {
    return (
      <StudyPlanStatusDialog
        key={`${selection.id}-${selection.targetStatus}`}
        effectiveFrom={selection.effectiveFrom}
        id={selection.id}
        institutionId={institutionId}
        onOpenChange={onOpenChange}
        open
        returnTo={returnTo}
        scope={scope}
        studyPlanLabel={selection.studyPlanLabel}
        targetStatus={selection.targetStatus}
      />
    );
  }

  if (selection.resource === AcademicResource.COURSE) {
    return (
      <CourseStatusDialog
        id={selection.id}
        institutionId={institutionId}
        onOpenChange={onOpenChange}
        open
        resourceLabel={selection.resourceLabel}
        returnTo={returnTo}
        scope={scope}
        targetStatus={selection.targetStatus}
      />
    );
  }

  return (
    <ActiveAcademicStatusDialog
      id={selection.id}
      institutionId={institutionId}
      onOpenChange={onOpenChange}
      open
      resource={selection.resource}
      resourceLabel={selection.resourceLabel}
      returnTo={returnTo}
      scope={scope}
      targetStatus={selection.targetStatus as "ACTIVE" | "INACTIVE"}
    />
  );
}
