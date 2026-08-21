"use client";

import * as React from "react";
import { LibraryBigIcon, RouteIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicOptionDropdownProps = {
  ariaInvalid: boolean;
  disabled?: boolean;
  institutionId: string;
  initialValue?: string;
  name: string;
  scope: AcademicScope;
  selectedLabel?: string;
};

export function TrainingPathDropdown(props: AcademicOptionDropdownProps): React.ReactElement {
  const [value, setValue] = React.useState(props.initialValue);
  const [selectedLabel, setSelectedLabel] = React.useState(props.selectedLabel);
  const fetchPage = React.useCallback(
    (input: AsyncDropdownFetchPageInput) => fetchAcademicOptionPage<TrainingPath>("training-paths", props.scope, props.institutionId, input),
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
        setValue(nextValue);
        setSelectedLabel(item?.name);
      }}
      placeholder="Seleccionar trayecto"
      queryKey={["academic-options", "training-paths", props.scope, props.institutionId]}
      searchPlaceholder="Buscar trayecto..."
      selectedLabel={selectedLabel}
      value={value}
    />
  );
}

export function AcademicSpaceDropdown(props: AcademicOptionDropdownProps): React.ReactElement {
  const [value, setValue] = React.useState(props.initialValue);
  const [selectedLabel, setSelectedLabel] = React.useState(props.selectedLabel);
  const fetchPage = React.useCallback(
    (input: AsyncDropdownFetchPageInput) => fetchAcademicOptionPage<AcademicSpace>("academic-spaces", props.scope, props.institutionId, input),
    [props.institutionId, props.scope],
  );

  return (
    <AsyncDropdown<AcademicSpace>
      ariaInvalid={props.ariaInvalid}
      disabled={props.disabled}
      emptyDescription="Todavía no se registraron espacios académicos en esta institución."
      emptyIcon={LibraryBigIcon}
      emptyMessage="No se encontraron espacios académicos."
      emptyTitle="No hay espacios académicos"
      errorMessage="No se pudieron cargar los espacios académicos."
      fetchPage={fetchPage}
      getItemLabel={(item) => `${item.name} · ${academicSpaceTypeLabels[item.type]}`}
      getItemValue={(item) => item.id}
      id={props.name}
      name={props.name}
      onValueChange={(nextValue, item) => {
        setValue(nextValue);
        setSelectedLabel(item ? `${item.name} · ${academicSpaceTypeLabels[item.type]}` : undefined);
      }}
      placeholder="Seleccionar espacio"
      queryKey={["academic-options", "academic-spaces", props.scope, props.institutionId]}
      searchPlaceholder="Buscar espacio..."
      selectedLabel={selectedLabel}
      value={value}
    />
  );
}
