"use client";

import type { ReactElement } from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";

import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";

export function DocumentCatalogInstitutionSelect({ value, label }: { value?: string; label?: string }): ReactElement {
  const { navigate, isPending } = useDataTableNavigation();

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor="catalog-institution" className="text-foreground text-sm font-medium">
        Institución
      </label>
      <AsyncDropdown<{ id: string; name: string }>
        id="catalog-institution"
        value={value}
        defaultOption={{ label: "Todas las instituciones", value: undefined }}
        selectedLabel={label}
        placeholder="Todas las instituciones"
        searchPlaceholder="Buscar institución..."
        clearable
        clearLabel="Limpiar institución"
        queryKey={["catalog-institutions"]}
        disabled={isPending}
        fetchPage={fetchPlatformInstitutionOptions}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        onValueChange={(id) => {
          navigate({ institutionId: id, page: "0", returnTo: undefined }, { replace: true });
        }}
      />
    </div>
  );
}
