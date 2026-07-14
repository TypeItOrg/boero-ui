"use client";

import { DataTableFilters } from "@common/components/ui/data-table-filters";

type PeopleSearchFormProps = {
  search: string;
  size: number;
};

export function PeopleSearchForm({ search, size }: PeopleSearchFormProps): React.ReactElement {
  return (
    <DataTableFilters
      className="md:grid-cols-[minmax(16rem,1fr)_auto]"
      search={search}
      searchPlaceholder="Buscar por nombre, apellido o documento..."
      size={size}
    />
  );
}
