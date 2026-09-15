import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";

export async function fetchEnrollmentApplication(applicationId: string): Promise<EnrollmentApplicationResponse> {
  return parseHttpResponse(
    await fetch(`/api/enrollment-applications/${applicationId}`, { cache: "no-store" }),
    ENROLLMENT_MESSAGES.APPLICATION_UNAVAILABLE,
  );
}

export async function fetchEnrollmentTrainingPaths(applicationId: string): Promise<TrainingPath[]> {
  return parseHttpResponse(
    await fetch(`/api/enrollment-applications/${applicationId}/training-paths`, { cache: "no-store" }),
    ENROLLMENT_MESSAGES.TRAINING_PATHS_UNAVAILABLE,
  );
}
