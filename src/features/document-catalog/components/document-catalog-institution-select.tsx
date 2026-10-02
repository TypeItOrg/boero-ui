"use client";

import * as React from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";

import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";

export function DocumentCatalogInstitutionSelect({ value, label }: { value?: string; label?: string }): React.ReactElement {
  const { navigate, isPending } = useDataTableNavigation();

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <label htmlFor="catalog-institution" className="text-foreground text-sm font-medium">
        Institución
      </label>
      <AsyncDropdown<{ id: string; name: string }>
        id="catalog-institution"
        value={value}
        defaultOption={value && label ? { value, label } : undefined}
        placeholder="Seleccionar institución"
        queryKey={["catalog-institutions"]}
        disabled={isPending}
        fetchPage={fetchPlatformInstitutionOptions}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        onValueChange={(id) => {
          if (id) {
            navigate({ institutionId: id, page: "0", documentId: undefined, returnTo: undefined }, { replace: true });
          }
        }}
      />
    </div>
  );
}
