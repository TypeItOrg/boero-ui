import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import { ENROLLMENT_APPLICATIONS_API_PATH } from "../constants/enrollment-application.constants";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import type {
  EnrollmentApplication,
  EnrollmentApplicationResponse,
  EnrollmentAttachment,
  EnrollmentDocumentType,
  FetchEnrollmentApplicationsParams as FetchDraftApplicationsParams,
  StartEnrollmentApplicationInput,
  UpdateEnrollmentDraftInput,
} from "../types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { enrollmentApplicationApiFetch } from "./enrollment-application-api-fetch.service";

export type FetchEnrollmentApplicationsParams = {
  page: number;
  size: number;
  status?: EnrollmentApplicationStatus;
};

export async function fetchEnrollmentApplications(
  institutionId: string,
  params: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>>;
export async function fetchEnrollmentApplications(params?: FetchDraftApplicationsParams): Promise<PaginatedResponse<EnrollmentApplicationResponse>>;
export async function fetchEnrollmentApplications(
  first?: string | FetchDraftApplicationsParams,
  second?: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication> | PaginatedResponse<EnrollmentApplicationResponse>> {
  if (typeof first === "string") {
    const institutionId = first;
    const params = second ?? { page: 0, size: 10 };
    const response = await enrollmentApplicationApiFetch(
      `/api/v1/institutions/${institutionId}/enrollment-applications?${buildListSearchParams(params)}`,
    );

    return parseHttpResponse(response, ENROLLMENT_APPLICATION_ERROR_MESSAGES.FETCH);
  }

  const params = first;
  const queryParams = new URLSearchParams();
  if (params?.periodId && params.periodId !== "all") {
    queryParams.set("periodId", params.periodId);
  }
  if (params?.status && params.status !== "all") {
    queryParams.set("status", params.status);
  }
  if (params?.search?.trim()) {
    queryParams.set("search", params.search.trim());
  }
  if (params?.page !== undefined) {
    queryParams.set("page", String(params.page));
  }
  if (params?.size !== undefined) {
    queryParams.set("size", String(params.size));
  }

  const queryString = queryParams.toString();
  const url = `${ENROLLMENT_APPLICATIONS_API_PATH}${queryString ? `?${queryString}` : ""}`;

  const response = await institutionalApiFetch(url, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al obtener las inscripciones");
  }

  return response.json();
}

export async function fetchMyEnrollmentApplications(
  institutionId: string,
  params: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const response = await enrollmentApplicationApiFetch(
    `/api/v1/institutions/${institutionId}/my-enrollment-applications?${buildListSearchParams(params)}`,
  );

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

export async function uploadEnrollmentAttachment(
  applicationId: string,
  documentType: EnrollmentDocumentType,
  file: File,
): Promise<EnrollmentAttachment> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("attachmentType", documentType);

  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/attachments`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al subir el archivo adjunto");
  }

  return response.json();
}

export async function deleteEnrollmentAttachment(applicationId: string, attachmentId: string): Promise<void> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/attachments/${attachmentId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al eliminar el archivo adjunto");
  }
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
