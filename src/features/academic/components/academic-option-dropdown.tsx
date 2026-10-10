"use client";

import { useCallback, useState, type ReactElement } from "react";

import { LibraryBigIcon, RouteIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";

import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ACADEMIC_SPACE_OPTION_PRESENTATION, getAcademicSpaceOptionLabel } from "@features/academic/utils/academic-space-option.util";

type AcademicOptionDropdownProps = {
  ariaInvalid: boolean;
  disabled?: boolean;
  institutionId: string;
  initialValue?: string;
  name: string;
  scope: AcademicScope;
  selectedLabel?: string;
};

export function TrainingPathDropdown(props: AcademicOptionDropdownProps): ReactElement {
  const [selection, setSelection] = useState({ value: props.initialValue, label: props.selectedLabel });

  const fetchPage = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<TrainingPath>("training-paths", props.scope, props.institutionId, input, { operation: "STUDY_PLAN_CREATE" }),
    [props.institutionId, props.scope],
  );

  return (
    <AsyncDropdown<TrainingPath>
      ariaInvalid={props.ariaInvalid}
      disabled={props.disabled}
      emptyDescription="Todavía no se registraron trayectos formativos en esta institución."
      emptyIcon={RouteIcon}
      emptyMessage="No se encontraron trayectos formativos."
      emptyTitle="No hay trayectos formativos"
      errorMessage="No se pudieron cargar los trayectos formativos."
      fetchPage={fetchPage}
      getItemLabel={(item) => item.name}
      getItemValue={(item) => item.id}
      id={props.name}
      name={props.name}
      onValueChange={(nextValue, item) => {
        setSelection({ value: nextValue, label: item?.name });
      }}
      placeholder="Seleccionar trayecto"
      queryKey={["academic-options", "training-paths", props.scope, props.institutionId]}
      searchPlaceholder="Buscar trayecto..."
      selectedLabel={selection.label}
      value={selection.value}
    />
  );
}

export function AcademicSpaceDropdown(props: AcademicOptionDropdownProps): ReactElement {
  const [selection, setSelection] = useState({ value: props.initialValue, label: props.selectedLabel });

  const fetchPage = useCallback(
    (input: AsyncDropdownFetchPageInput) =>
      fetchAcademicOptionPage<AcademicSpace>("academic-spaces", props.scope, props.institutionId, input, {
        operation: "STUDY_PLAN_CURRICULUM_UPDATE",
      }),
    [props.institutionId, props.scope],
  );

  return (
    <AsyncDropdown<AcademicSpace>
      {...ACADEMIC_SPACE_OPTION_PRESENTATION}
      ariaInvalid={props.ariaInvalid}
      disabled={props.disabled}
      emptyDescription="Todavía no se registraron espacios académicos en esta institución."
      emptyIcon={LibraryBigIcon}
      emptyMessage="No se encontraron espacios académicos."
      emptyTitle="No hay espacios académicos"
      errorMessage="No se pudieron cargar los espacios académicos."
      fetchPage={fetchPage}
      getItemLabel={getAcademicSpaceOptionLabel}
      getItemValue={(item) => item.id}
      id={props.name}
      name={props.name}
      onValueChange={(nextValue, item) => {
        setSelection({ value: nextValue, label: item ? getAcademicSpaceOptionLabel(item) : undefined });
      }}
      placeholder="Seleccionar espacio"
      queryKey={["academic-options", "academic-spaces", props.scope, props.institutionId]}
      searchPlaceholder="Buscar espacio..."
      selectedLabel={selection.label}
      value={selection.value}
    />
  );
}
