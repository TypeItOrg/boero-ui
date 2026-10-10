"use client";

import type { ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Input } from "@common/components/ui/input";
import type { FormValue } from "@common/types/form-value.types";
import { toOptionalFormString } from "@common/utils/form-value.util";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function CourseInstrumentField({
  onValueChange,
  fieldErrors,
  institutionId,
  scope,
  editing,
  studyPlanSpaceId,
  initialValues,
  instrumentId,
}: {
  onValueChange: (value: string | undefined) => void;
  fieldErrors: Record<string, string> | undefined;
  institutionId: string | undefined;
  scope: AcademicScope | undefined;
  editing: boolean;
  studyPlanSpaceId: string | undefined;
  initialValues: Record<string, FormValue>;
  instrumentId: string | undefined;
}): ReactElement {
  return (
    <FormField label="Instrumento" name="instrumentId" error={fieldErrors?.instrumentId} className="flex-[1_0_min(300px,100%)]" required>
      {institutionId && scope ? (
        <AsyncDropdown<{ id: string; name: string }>
          ariaInvalid={Boolean(fieldErrors?.instrumentId)}
          disabled={editing}
          emptyMessage="No hay instrumentos activos."
          errorMessage="No se pudieron cargar los instrumentos."
          fetchPage={(input) =>
            fetchAcademicOptionPage<{ id: string; name: string }>("instruments", scope, institutionId, input, {
              operation: editing ? "COURSE_UPDATE" : "COURSE_CREATE",
              active: true,
            })
          }
          getItemLabel={(item) => item.name}
          getItemValue={(item) => item.id}
          id="instrumentId"
          key={`instrument-${institutionId}-${studyPlanSpaceId ?? "none"}`}
          name="instrumentDisplay"
          onValueChange={onValueChange}
          placeholder="Seleccionar instrumento"
          queryKey={["courses", "instruments", scope, institutionId]}
          searchPlaceholder="Buscar instrumento…"
          selectedLabel={toOptionalFormString(initialValues.instrumentName)}
          value={instrumentId}
        />
      ) : (
        <Input disabled placeholder="Seleccioná una institución primero" type="text" />
      )}
    </FormField>
  );
}
