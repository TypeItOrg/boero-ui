import { type DataTableFilterOption } from "@common/types/data-table-filter-option.types";

export type DataTableSelectFilter<TValue extends string = string> = {
  defaultValue: TValue;
  label: string;
  name: string;
  options: readonly DataTableFilterOption<TValue>[];
  value: TValue;
};
