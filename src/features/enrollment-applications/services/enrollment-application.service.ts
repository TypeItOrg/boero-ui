import "server-only";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { ENROLLMENT_APPLICATION_ERROR_MESSAGES } from "../constants/enrollment-application-error-messages.constants";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
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
): Promise<PaginatedResponse<EnrollmentApplication>> {
  const response = await enrollmentApplicationApiFetch(
    `/api/v1/institutions/${institutionId}/enrollment-applications?${buildListSearchParams(params)}`,
  );

  return parseHttpResponse(response, ENROLLMENT_APPLICATION_ERROR_MESSAGES.FETCH);
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
