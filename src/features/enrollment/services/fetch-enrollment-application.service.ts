import "server-only";

import { cache } from "react";

import { parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { EnrollmentApplication } from "@features/enrollment/types/enrollment-application.types";

const FALLBACK_MESSAGE = "No se pudo obtener la solicitud de inscripción.";

async function getEnrollmentApplication(applicationId: string): Promise<EnrollmentApplication | null> {
  const response = await institutionalApiFetch(`/api/v1/enrollment-applications/${applicationId}`);
  return parseNullableHttpResponse<EnrollmentApplication>(response, FALLBACK_MESSAGE);
}

export const fetchEnrollmentApplication = cache(getEnrollmentApplication);
