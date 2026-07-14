import type { QueryParamValue } from "@common/types/query-param.types";
import { getQueryParamValue } from "@common/utils/query-param.util";

export type SortDirection = "asc" | "desc";

export type Sort<TField extends string> = {
  field: TField;
  direction: SortDirection;
};

export type SortSearchParams = {
  sortField?: QueryParamValue;
  sortDirection?: QueryParamValue;
};

export function parseSortQuery<TField extends string>(
  searchParams: SortSearchParams,
  allowedFields: ReadonlySet<TField>,
  defaultSort: Sort<TField>,
): Sort<TField> {
  const field = getQueryParamValue(searchParams.sortField);
  const direction = getQueryParamValue(searchParams.sortDirection);

  if (!field || !allowedFields.has(field as TField) || !isSortDirection(direction)) {
    return defaultSort;
  }

  return { field: field as TField, direction };
}

export function getSortDirection<TField extends string>(sort: Sort<TField>, field: TField): SortDirection | undefined {
  return sort.field === field ? sort.direction : undefined;
}

export function getNextSort<TField extends string>(
  sort: Sort<TField>,
  field: TField,
  defaultDirection: SortDirection = "asc",
): Sort<TField> {
  const direction = sort.field === field ? getOppositeSortDirection(sort.direction) : defaultDirection;

  return { field, direction };
}

export function serializeSpringSort<TField extends string>(sort: Sort<TField>): string {
  return `${sort.field},${sort.direction}`;
}

function getOppositeSortDirection(direction: SortDirection): SortDirection {
  return direction === "asc" ? "desc" : "asc";
}

function isSortDirection(value: string | undefined): value is SortDirection {
  return value === "asc" || value === "desc";
}
