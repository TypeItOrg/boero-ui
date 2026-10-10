"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Input } from "@common/components/ui/input";
import type { FormValue } from "@common/types/form-value.types";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function CourseAcademicYearField({
  fieldErrors,
  institutionId,
  scope,
  editing,
  setAcademicYearId,
  initialValues,
  academicYearId,
}: {
  fieldErrors: Record<string, string> | undefined;
  institutionId: string | undefined;
  scope: AcademicScope | undefined;
  editing: boolean;
  setAcademicYearId: Dispatch<SetStateAction<string | undefined>>;
  initialValues: Record<string, FormValue>;
  academicYearId: string | undefined;
}): ReactElement {
  return (
    <FormField label="Ciclo lectivo" name="academicYearId" error={fieldErrors?.academicYearId} className="w-full flex-[1_0_100%]" required>
      {institutionId && scope ? (
        <AsyncDropdown<{ id: string; year: number }>
          ariaInvalid={Boolean(fieldErrors?.academicYearId)}
          disabled={editing}
          emptyMessage="No se encontraron ciclos lectivos."
          errorMessage="No se pudieron cargar los ciclos lectivos."
          fetchPage={(input) =>
            fetchAcademicOptionPage<{ id: string; year: number }>("academic-years", scope, institutionId, input, {
              operation: editing ? "COURSE_UPDATE" : "COURSE_CREATE",
              active: "all",
              status: "ACTIVE",
            })
          }
          getItemLabel={(item) => String(item.year)}
          getItemValue={(item) => item.id}
          id="academicYearId"
          key={`year-${institutionId}`}
          name="academicYearDisplay"
          onValueChange={(value) => setAcademicYearId(value)}
          placeholder={editing ? "Definido por el curso" : "Seleccionar ciclo lectivo"}
          queryKey={["courses", "academic-years", scope, institutionId]}
          searchPlaceholder="Buscar año…"
          selectedLabel={initialValues.year !== undefined ? String(initialValues.year) : undefined}
          value={academicYearId}
        />
      ) : (
        <Input disabled placeholder="Seleccioná una institución primero" type="text" />
      )}
    </FormField>
  );
}
