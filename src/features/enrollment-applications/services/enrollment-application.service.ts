import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse, parseNullableHttpResponse } from "@common/utils/http-response-error.util";

import { ENROLLMENT_APPLICATIONS_API_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";
import type { StartEnrollmentApplicationInput } from "@features/enrollment-applications/types/start-enrollment-application-input.types";
import type { UpdateEnrollmentDraftInput } from "@features/enrollment-applications/types/update-enrollment-draft-input.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export type FetchEnrollmentApplicationsParams = {
  page: number;
  size: number;
  status?: EnrollmentApplicationStatus;
  trainingPathId?: string;
  open?: boolean;
  pendingDocuments?: boolean;
};

export async function fetchEnrollmentApplications(
  institutionId: string,
  params: FetchEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/enrollment-applications?${buildListSearchParams(params)}`);

  return parseHttpResponse(response, ENROLLMENT_MESSAGES.FETCH);
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

  return parseHttpResponse(response, ENROLLMENT_MESSAGES.FETCH);
}

export async function fetchPlatformEnrollmentApplicationById(
  institutionId: string,
  applicationId: string,
): Promise<EnrollmentApplicationResponse | null> {
  const response = await platformApiFetch(`/api/v1/admin/enrollment-applications/${institutionId}/${applicationId}`);

  return parseNullableHttpResponse(response, ENROLLMENT_MESSAGES.FETCH);
}

export async function fetchInstitutionalEnrollmentApplicationById(
  institutionId: string,
  applicationId: string,
): Promise<EnrollmentApplicationResponse | null> {
  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/enrollment-applications/${applicationId}`);

  return parseNullableHttpResponse(response, ENROLLMENT_MESSAGES.FETCH);
}

export type FetchMyEnrollmentApplicationsParams = FetchEnrollmentApplicationsParams & {
  /** Only the applications whose applicant is this person (the caller themself or one of their dependents). */
  dependentPersonId?: string;
};

export async function fetchMyEnrollmentApplications(
  institutionId: string,
  params: FetchMyEnrollmentApplicationsParams,
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const searchParams = buildListSearchParams(params);

  if (params.dependentPersonId) {
    searchParams.set("dependentPersonId", params.dependentPersonId);
  }

  const response = await institutionalApiFetch(`/api/v1/institutions/${institutionId}/my-enrollment-applications?${searchParams}`);

  return parseHttpResponse(response, ENROLLMENT_MESSAGES.FETCH_MY);
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

  if (params.pendingDocuments) {
    searchParams.set("pendingDocuments", "true");
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

    throw new Error(errorData.message || ENROLLMENT_MESSAGES.FETCH_APPLICATION_FAILED);
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

    throw new Error(errorData.message || ENROLLMENT_MESSAGES.CREATE_APPLICATION_FAILED);
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

    throw new Error(errorData.message || ENROLLMENT_MESSAGES.UPDATE_DRAFT_FAILED);
  }

  return response.json();
}

export async function submitEnrollmentApplication(applicationId: string): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/submit`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.message || ENROLLMENT_MESSAGES.SUBMIT_APPLICATION_FAILED);
  }

  return response.json();
}

export async function cancelEnrollmentApplication(applicationId: string): Promise<EnrollmentApplicationResponse> {
  const response = await institutionalApiFetch(`${ENROLLMENT_APPLICATIONS_API_PATH}/${applicationId}/cancel`, {
    method: "POST",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));

    throw new Error(errorData.message || ENROLLMENT_MESSAGES.CANCEL_APPLICATION_FAILED);
  }

  return response.json();
}

export { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";

export { fetchEnrollmentApplicationShifts } from "@features/enrollment-applications/services/enrollment-application-options.service";

export { fetchEnrollmentApplicationCourses } from "@features/enrollment-applications/services/enrollment-application-options.service";

export { fetchAvailableEnrollmentTrainingPaths } from "@features/enrollment-applications/services/enrollment-application-options.service";
