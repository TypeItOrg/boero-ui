import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";

const ACTIVE_FILTER_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "true", label: "Activas" },
  { value: "false", label: "Inactivas" },
] as const;

type ActiveFilterValue = (typeof ACTIVE_FILTER_OPTIONS)[number]["value"];

type InstitutionsTableFiltersProps = {
  active: boolean | undefined;
  search: string;
  size: number;
};

export function InstitutionsTableFilters({ active, search, size }: InstitutionsTableFiltersProps): React.ReactElement {
  const activeValue = active === undefined ? "all" : active ? "true" : "false";
  const selectFilters: DataTableSelectFilter<ActiveFilterValue>[] = [
    {
      defaultValue: "all",
      label: "Estado",
      name: "active",
      options: ACTIVE_FILTER_OPTIONS,
      value: activeValue,
    },
  ];

  return (
    <DataTableFilters
      className="md:grid-cols-[minmax(16rem,1fr)_auto_auto]"
      search={search}
      searchPlaceholder="Buscar por nombre, ciudad, provincia o país..."
      selectFilters={selectFilters}
      size={size}
    />
  );
}
