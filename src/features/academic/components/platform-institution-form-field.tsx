"use client";

import { BuildingIcon } from "lucide-react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { FormField } from "@features/academic/components/academic-form-controls";
import { fetchActivePlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

const QUERY_KEY = ["platform", "academic", "form-institutions"] as const;

export function PlatformInstitutionFormField({
  error,
  institution,
  onChange,
}: {
  error?: string;
  institution?: InstitutionSummary;
  onChange: (institution: InstitutionSummary | undefined) => void;
}): React.ReactElement {
  return (
    <FormField label="Institución" name="institutionId" error={error} className="w-full flex-[1_0_100%]" required>
      <AsyncDropdown<InstitutionSummary>
        ariaInvalid={Boolean(error)}
        emptyDescription="No hay instituciones activas disponibles."
        emptyIcon={BuildingIcon}
        emptyMessage="No se encontraron instituciones."
        emptyTitle="No hay instituciones"
        errorMessage="No se pudieron cargar las instituciones."
        fetchPage={fetchActivePlatformInstitutionOptions}
        getItemLabel={(item) => item.name}
        getItemValue={(item) => item.id}
        id="institutionId"
        name="institutionId"
        onValueChange={(_value, item) => onChange(item)}
        placeholder="Seleccionar institución"
        queryKey={QUERY_KEY}
        searchPlaceholder="Buscar institución..."
        selectedLabel={institution?.name}
        value={institution?.id}
      />
    </FormField>
  );
}
