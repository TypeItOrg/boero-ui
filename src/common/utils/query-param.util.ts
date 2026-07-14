import type { QueryParamValue } from "@common/types/query-param.types";

export function getQueryParamValue(value: QueryParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseOptionalBooleanQueryParam(value: QueryParamValue): boolean | undefined {
  const rawValue = getQueryParamValue(value);

  if (rawValue === "true") return true;
  if (rawValue === "false") return false;

  return undefined;
}
