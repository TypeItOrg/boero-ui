import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";

const ENABLED_FILTER_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "true", label: "Habilitadas" },
  { value: "false", label: "Deshabilitadas" },
] as const;

type EnabledFilterValue = (typeof ENABLED_FILTER_OPTIONS)[number]["value"];

type PlatformAccountsTableFiltersProps = {
  enabled: boolean | undefined;
  search: string;
  size: number;
};

export function PlatformAccountsTableFilters({
  enabled,
  search,
  size,
}: PlatformAccountsTableFiltersProps): React.ReactElement {
  const enabledValue = enabled === undefined ? "all" : enabled ? "true" : "false";
  const selectFilters: DataTableSelectFilter<EnabledFilterValue>[] = [
    {
      defaultValue: "all",
      label: "Estado",
      name: "enabled",
      options: ENABLED_FILTER_OPTIONS,
      value: enabledValue,
    },
  ];

  return (
    <DataTableFilters
      className="md:grid-cols-[minmax(16rem,1fr)_auto]"
      search={search}
      searchPlaceholder="Buscar por nombre o correo electrónico..."
      selectFilters={selectFilters}
      size={size}
    />
  );
}
