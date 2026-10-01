"use client";

import { DataTableFilters } from "@common/components/ui/data-table-filters";

type TeachersSearchFormProps = {
  search: string;
  size: number;
};

export function TeachersSearchForm({ search, size }: TeachersSearchFormProps): React.ReactElement {
  return <DataTableFilters search={search} searchPlaceholder="Buscar por nombre, apellido o documento..." size={size} />;
}
