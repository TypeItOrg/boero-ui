import type { ReactElement } from "react";

import { DataTableFilters } from "@common/components/ui/data-table-filters";

type InstitutionRolesTableFiltersProps = {
  search: string;
  size: number;
};

export function InstitutionRolesTableFilters({ search, size }: InstitutionRolesTableFiltersProps): ReactElement {
  return <DataTableFilters search={search} searchPlaceholder="Buscar roles por nombre o código..." size={size} />;
}
