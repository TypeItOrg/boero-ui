import type { QueryParamValue } from "@common/types/query-param.types";
import { getQueryParamValue } from "@common/utils/query-param.util";

export function getSafeReturnTo(value: QueryParamValue, fallback: string): string {
  const returnTo = getQueryParamValue(value);

  if (returnTo && isInternalPath(returnTo)) {
    return returnTo;
  }

  return fallback;
}

function isInternalPath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return false;

  try {
    return new URL(value, "https://return-to.invalid").origin === "https://return-to.invalid";
  } catch {
    return false;
  }
}

export function appendReturnTo(path: string, returnTo: string): string {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}returnTo=${encodeURIComponent(returnTo)}`;
}
