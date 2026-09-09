import "server-only";

import { cache } from "react";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { EnrollmentApplication } from "@features/enrollment/types/enrollment-application.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

const FALLBACK_MESSAGE = "No se pudieron obtener las solicitudes de inscripción.";

async function getEnrollmentApplications(): Promise<EnrollmentApplication[]> {
  const response = await institutionalApiFetch("/api/v1/enrollment-applications");
  return parseHttpResponse<EnrollmentApplication[]>(response, FALLBACK_MESSAGE);
}

export const fetchEnrollmentApplications = cache(getEnrollmentApplications);
