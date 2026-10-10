"use client";

import type { ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Input } from "@common/components/ui/input";
import type { FormValue } from "@common/types/form-value.types";
import { toOptionalFormString } from "@common/utils/form-value.util";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";

export function CourseStudyPlanField({
  onValueChange,
  fieldErrors,
  institutionId,
  scope,
  editing,
  classesLocked,
  initialValues,
  studyPlanId,
}: {
  onValueChange: (value: string | undefined) => void;
  fieldErrors: Record<string, string> | undefined;
  institutionId: string | undefined;
  scope: AcademicScope | undefined;
  editing: boolean;
  classesLocked: boolean;
  initialValues: Record<string, FormValue>;
  studyPlanId: string | undefined;
}): ReactElement {
  return (
    <FormField label="Plan de estudio" name="studyPlanId" error={fieldErrors?.studyPlanId} className="flex-[1_0_min(300px,100%)]" required>
      {institutionId && scope ? (
        <AsyncDropdown<StudyPlan>
          ariaInvalid={Boolean(fieldErrors?.studyPlanId)}
          disabled={editing || classesLocked}
          emptyMessage="No se encontraron planes activos."
          errorMessage="No se pudieron cargar los planes de estudio."
          fetchPage={(input) =>
            fetchAcademicOptionPage<StudyPlan>("study-plans", scope, institutionId, input, {
              operation: editing ? "COURSE_UPDATE" : "COURSE_CREATE",
              active: "all",
              status: "ACTIVE",
            })
          }
          getItemLabel={formatStudyPlanLabel}
          getItemValue={(item) => item.id}
          id="studyPlanId"
          key={`plan-${institutionId}`}
          name="studyPlanDisplay"
          onValueChange={onValueChange}
          placeholder={classesLocked ? "Definido por el curso" : "Seleccionar plan"}
          queryKey={["courses", "active-study-plans", scope, institutionId]}
          searchPlaceholder="Buscar plan…"
          selectedLabel={
            initialValues.studyPlanName
              ? formatStudyPlanLabel({
                  studyPlanName: toOptionalFormString(initialValues.studyPlanName),
                  trainingPathName: toOptionalFormString(initialValues.trainingPathName),
                  studyPlanVersion: Number(initialValues.studyPlanVersion) || undefined,
                })
              : undefined
          }
          value={studyPlanId}
        />
      ) : (
        <Input disabled placeholder="Seleccioná una institución primero" type="text" />
      )}
    </FormField>
  );
}
