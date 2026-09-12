import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { ENROLLMENT_APPLICATIONS_API_PATH } from "../constants/enrollment-application.constants";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import type {
  EnrollmentApplication,
  EnrollmentApplicationResponse,
  StartEnrollmentApplicationInput,
  UpdateEnrollmentDraftInput,
} from "../types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";

export type FetchEnrollmentApplicationsParams = {
  page: number;
  size: number;
  status?: EnrollmentApplicationStatus;
  trainingPathId?: string;
  open?: boolean;
};

export async function fetchEnrollmentApplications(
  institutionId: string,
  params: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/enrollment-applications?${buildListSearchParams(params)}`);

  return parseHttpResponse(response, ENROLLMENT_APPLICATION_ERROR_MESSAGES.FETCH);
}

export type FetchPlatformEnrollmentApplicationsParams = FetchEnrollmentApplicationsParams & {
  institutionId?: string;
};

export async function fetchPlatformEnrollmentApplications(
  params: FetchPlatformEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const searchParams = buildListSearchParams(params);
  if (params.institutionId) {
    searchParams.set("institutionId", params.institutionId);
  }

  const response = await platformApiFetch(`/api/v1/admin/enrollment-applications?${searchParams}`);

  return parseHttpResponse(response, ENROLLMENT_APPLICATION_ERROR_MESSAGES.FETCH);
}

export async function fetchPlatformEnrollmentApplicationById(
  institutionId: string,
  applicationId: string,
): Promise<EnrollmentApplicationResponse | null> {
  const response = await platformApiFetch(`/api/v1/admin/enrollment-applications/${institutionId}/${applicationId}`);

  return parseNullableHttpResponse(response, ENROLLMENT_APPLICATION_ERROR_MESSAGES.FETCH);
}

export async function fetchMyEnrollmentApplications(
  institutionId: string,
  params: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/my-enrollment-applications?${buildListSearchParams(params)}`);

  return parseHttpResponse(response, ENROLLMENT_APPLICATION_ERROR_MESSAGES.FETCH_MY);
}

function buildListSearchParams(params: FetchEnrollmentApplicationsParams): URLSearchParams {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params.page));
  searchParams.set("size", String(params.size));
  searchParams.set("sort", "createdAt,desc");

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.trainingPathId) {
    searchParams.set("trainingPathId", params.trainingPathId);
  }

  if (params.open) {
    searchParams.set("open", "true");
  }

  return searchParams;
}

export async function fetchEnrollmentApplicationById(applicationId: string): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al obtener la solicitud de inscripción");
  }

  return response.json();
}

export const getEnrollmentApplication = fetchEnrollmentApplicationById;

export async function startOrGetEnrollmentApplication(input: StartEnrollmentApplicationInput): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(ENROLLMENT_APPLICATIONS_API_PATH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al iniciar la solicitud de inscripción");
  }

  return response.json();
}

export async function updateEnrollmentDraft(applicationId: string, input: UpdateEnrollmentDraftInput): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/draft`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al actualizar el borrador de inscripción");
  }

  return response.json();
}

export async function submitEnrollmentApplication(applicationId: string): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/submit`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al enviar la solicitud de inscripción");
  }

  return response.json();
}

export async function cancelEnrollmentApplication(applicationId: string): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/cancel`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al cancelar la solicitud de inscripción");
  }

  return response.json();
}

export async function fetchEnrollmentApplicationTrainingPaths(applicationId: string): Promise<TrainingPath[]> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/training-paths`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al obtener los trayectos formativos disponibles");
  }

  return response.json();
}

export async function fetchEnrollmentApplicationStudyPlanSpaces(applicationId: string): Promise<StudyPlanSpace[]> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/study-plan-spaces`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al obtener los espacios académicos disponibles");
  }

  return response.json();
}

export { getAttachmentDownloadUrl } from "../utils/enrollment-application.util";
