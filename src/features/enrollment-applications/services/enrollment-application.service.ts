import "server-only";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { ENROLLMENT_APPLICATIONS_API_PATH } from "../constants/enrollment-application.constants";
import { EnrollmentApplicationResponse, StartEnrollmentApplicationInput, UpdateEnrollmentDraftInput } from "../types/enrollment-application.types";

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

export async function getEnrollmentApplication(applicationId: string): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}`, {
    method: "GET",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Error al obtener la solicitud de inscripción");
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
