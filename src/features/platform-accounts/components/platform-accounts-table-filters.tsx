import type { ReactElement } from "react";

import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { getBooleanFilterValue } from "@common/utils/boolean-filter-value.util";

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

export function PlatformAccountsTableFilters({ enabled, search, size }: PlatformAccountsTableFiltersProps): ReactElement {
  const enabledValue = getBooleanFilterValue(enabled);

  const selectFilters: DataTableSelectFilter<EnabledFilterValue>[] = [
    {
      defaultValue: "all",
      label: "Estado",
      name: "enabled",
      options: ENABLED_FILTER_OPTIONS,
      value: enabledValue,
    },
  ];

  return <DataTableFilters search={search} searchPlaceholder="Buscar por nombre o correo electrónico..." selectFilters={selectFilters} size={size} />;
}
