import "server-only";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { ENROLLMENT_APPLICATIONS_API_PATH } from "../constants/enrollment-application.constants";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type {
  EnrollmentApplicationResponse,
  EnrollmentAttachment,
  EnrollmentDocumentType,
  FetchEnrollmentApplicationsParams,
  StartEnrollmentApplicationInput,
  UpdateEnrollmentDraftInput,
} from "../types/enrollment-application.types";

export async function fetchEnrollmentApplications(
  params?: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplicationResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.enrollmentPeriodId && params.enrollmentPeriodId !== "all") {
    queryParams.set("enrollmentPeriodId", params.enrollmentPeriodId);
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
  formData.append("documentType", documentType);

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

export { getAttachmentDownloadUrl } from "../utils/enrollment-application.util";
