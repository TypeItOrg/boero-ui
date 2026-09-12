import "server-only";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type {
  CreateEnrollmentPeriodRequest,
  EnrollmentPeriod,
  EnrollmentPeriodStatusRequest,
  UpdateEnrollmentPeriodRequest,
} from "../types/enrollment-period.types";

const getPeriodsPath = (institutionId: string) => `/api/v1/institutions/${institutionId}/enrollment-periods`;

function enrollmentApiFetch(scope: AcademicScopeType, path: string, init: RequestInit = {}): Promise<Response> {
  return AcademicScope.isAdmin(scope) ? platformApiFetch(path, init) : institutionalApiFetch(path, init);
}

export async function listEnrollmentPeriods(
  institutionId: string,
  params?: {
    academicYearId?: string;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  },
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
): Promise<PaginatedResponse<EnrollmentPeriod>> {
  const queryParams = new URLSearchParams();
  if (params?.academicYearId) queryParams.set("academicYearId", params.academicYearId);
  if (params?.status) queryParams.set("status", params.status);
  if (params?.search) queryParams.set("search", params.search);
  if (params?.page !== undefined) queryParams.set("page", String(params.page));
  if (params?.size !== undefined) queryParams.set("size", String(params.size));

  const queryString = queryParams.toString();
  const url = `${getPeriodsPath(institutionId)}${queryString ? `?${queryString}` : ""}`;

  const response = await enrollmentApiFetch(scope, url, { method: "GET" });
  if (!response.ok) {
    throw new Error("Error al obtener los períodos de inscripción");
  }
  return response.json();
}

export async function createEnrollmentPeriod(
  institutionId: string,
  request: CreateEnrollmentPeriodRequest,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
): Promise<EnrollmentPeriod> {
  const response = await enrollmentApiFetch(scope, getPeriodsPath(institutionId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al crear el período de inscripción");
  }
  return response.json();
}

export async function updateEnrollmentPeriod(
  institutionId: string,
  periodId: string,
  request: UpdateEnrollmentPeriodRequest,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
): Promise<EnrollmentPeriod> {
  const response = await enrollmentApiFetch(scope, `${getPeriodsPath(institutionId)}/${periodId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar el período de inscripción");
  }
  return response.json();
}

export async function updateEnrollmentPeriodStatus(
  institutionId: string,
  periodId: string,
  request: EnrollmentPeriodStatusRequest,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
): Promise<void> {
  const response = await enrollmentApiFetch(scope, `${getPeriodsPath(institutionId)}/${periodId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar el estado del período de inscripción");
  }
}

export async function deleteEnrollmentPeriod(
  institutionId: string,
  periodId: string,
  scope: AcademicScopeType = AcademicScope.INSTITUTIONAL,
): Promise<void> {
  const response = await enrollmentApiFetch(scope, `${getPeriodsPath(institutionId)}/${periodId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al eliminar el período de inscripción");
  }
}
