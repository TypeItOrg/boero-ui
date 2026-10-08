"use client";

import type { ReactElement } from "react";

import { GraduationCapIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Input } from "@common/components/ui/input";
import type { FormValue } from "@common/types/form-value.types";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchCourseSpaceOptions, type CourseSpaceOption } from "@features/academic/services/course-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { STUDY_PLAN_SPACE_OPTION_PRESENTATION, getAcademicSpaceOptionLabel } from "@features/academic/utils/academic-space-option.util";
import { composeInitialSpaceLabel } from "@features/academic/utils/course-form-draft.util";

export function CourseAcademicSpaceField({
  onValueChange,
  fieldErrors,
  institutionId,
  scope,
  studyPlanId,
  editing,
  classesLocked,
  spaceLabel,
  initialValues,
  spaceId,
}: {
  onValueChange: (value: string | undefined, item?: CourseSpaceOption) => void;
  fieldErrors: Record<string, string> | undefined;
  institutionId: string | undefined;
  scope: AcademicScope | undefined;
  studyPlanId: string | undefined;
  editing: boolean;
  classesLocked: boolean;
  spaceLabel: string | undefined;
  initialValues: Record<string, FormValue>;
  spaceId: string | undefined;
}): ReactElement {
  return (
    <FormField
      label="Espacio académico"
      name="academicSpaceId"
      error={fieldErrors?.academicSpaceId ?? fieldErrors?.studyPlanSpaceId ?? fieldErrors?.format}
      className="flex-[1_0_min(300px,100%)]"
      required
    >
      {institutionId && scope ? (
        studyPlanId ? (
          <AsyncDropdown<CourseSpaceOption>
            {...STUDY_PLAN_SPACE_OPTION_PRESENTATION}
            ariaInvalid={Boolean(fieldErrors?.academicSpaceId ?? fieldErrors?.studyPlanSpaceId ?? fieldErrors?.format)}
            disabled={editing || classesLocked}
            emptyDescription="Incorporá espacios al plan para poder instanciarlos."
            emptyIcon={GraduationCapIcon}
            emptyMessage="No se encontraron espacios en este plan."
            emptyTitle="No hay espacios"
            errorMessage="No se pudieron cargar los espacios del plan."
            fetchPage={(input) => fetchCourseSpaceOptions(scope, institutionId, studyPlanId, input)}
            getItemLabel={getAcademicSpaceOptionLabel}
            getItemValue={(item) => item.studyPlanSpaceId ?? item.id}
            id="academicSpaceId"
            key={`space-${institutionId}-${studyPlanId}`}
            name="academicSpaceDisplay"
            onValueChange={onValueChange}
            placeholder={classesLocked ? "Definido por el curso" : "Seleccionar espacio"}
            queryKey={["courses", "spaces", scope, institutionId, studyPlanId]}
            searchPlaceholder="Buscar espacio…"
            selectedLabel={spaceLabel ?? composeInitialSpaceLabel(initialValues)}
            value={spaceId}
          />
        ) : (
          <Input disabled placeholder="Primero seleccioná un plan de estudio" type="text" />
        )
      ) : (
        <Input disabled placeholder="Seleccioná una institución primero" type="text" />
      )}
    </FormField>
  );
}
