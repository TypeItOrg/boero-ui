"use client";

import type { ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";

import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";

export function DocumentCatalogInstitutionField({
  id,
  value,
  label,
  disabled = false,
  readOnly = false,
  clearable = true,
  excludedInstitutionId,
  onValueChange,
}: {
  id: string;
  value?: string;
  label?: string;
  disabled?: boolean;
  readOnly?: boolean;
  clearable?: boolean;
  excludedInstitutionId?: string;
  onValueChange?: (id: string | undefined, item: { id: string; name: string } | undefined) => void;
}): ReactElement {
  return (
    <FormField name={id} label="Institución" required={!readOnly}>
      <AsyncDropdown<{ id: string; name: string }>
        id={id}
        value={value}
        selectedLabel={label}
        placeholder="Seleccionar institución"
        searchPlaceholder="Buscar institución..."
        queryKey={["catalog-institutions", excludedInstitutionId]}
        disabled={disabled || readOnly}
        aria-required={!readOnly || undefined}
        clearable={clearable && !readOnly}
        clearLabel="Limpiar institución"
        fetchPage={async (input) => {
          const page = await fetchPlatformInstitutionOptions(input);

          return { ...page, items: page.items.filter((item) => item.id !== excludedInstitutionId) };
        }}
        emptyTitle={excludedInstitutionId ? "No hay otras instituciones" : undefined}
        emptyDescription={excludedInstitutionId ? "Necesitás otra institución para crear esta copia." : undefined}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        onValueChange={(nextId, item) => {
          onValueChange?.(nextId, item);
        }}
      />
    </FormField>
  );
}
