import { DataTableFilters } from "@common/components/ui/data-table-filters";

type InstitutionRolesTableFiltersProps = {
  search: string;
  size: number;
};

export function InstitutionRolesTableFilters({ search, size }: InstitutionRolesTableFiltersProps): React.ReactElement {
  return <DataTableFilters search={search} searchPlaceholder="Buscar roles por nombre o código..." size={size} />;
}
