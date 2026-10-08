import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase, type AcademicScope } from "@features/academic/utils/academic-scope.util";

export async function fetchPage<T>(
  scope: AcademicScope,
  institutionId: string | undefined,
  resource: string,
  params: Record<string, string | number | boolean | undefined>,
): Promise<PaginatedResponse<T>> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const base = institutionId ? getAcademicApiBase(scope, institutionId) : "/api/v1/admin";
  const response = await academicApiFetch(scope, `${base}/${resource}${query}`);

  return parseHttpResponse(response, FETCH_ERROR);
}

export async function fetchDetail<T>(scope: AcademicScope, institutionId: string, resource: string): Promise<T | null> {
  const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/${resource}`);

  return parseNullableHttpResponse(response, FETCH_ERROR);
}

export async function fetchDetailWithParams<T>(
  scope: AcademicScope,
  institutionId: string,
  resource: string,
  params: Record<string, string | number | undefined>,
): Promise<T | null> {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.size > 0 ? `?${searchParams.toString()}` : "";
  const response = await academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/${resource}${query}`);

  return parseNullableHttpResponse(response, FETCH_ERROR);
}

export const FETCH_ERROR = "No se pudo obtener la información académica.";
