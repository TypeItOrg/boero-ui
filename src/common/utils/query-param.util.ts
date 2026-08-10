import type { QueryParamValue } from "@common/types/query-param.types";
import { isValidUuid } from "@common/utils/uuid.util";

export function getQueryParamValue(value: QueryParamValue): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function parseOptionalBooleanQueryParam(value: QueryParamValue): boolean | undefined {
  const rawValue = getQueryParamValue(value);

  if (rawValue === "true") return true;
  if (rawValue === "false") return false;

  return undefined;
}

export function parseUuidQueryParam(value: QueryParamValue): string | undefined {
  const parsed = getQueryParamValue(value);
  return isValidUuid(parsed) ? parsed : undefined;
}
