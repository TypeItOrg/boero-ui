import type { ChangeEnrollmentCareerResult } from "@features/enrollment-applications/types/change-enrollment-career-result.types";

export function unwrapEnrollmentResult(result: ChangeEnrollmentCareerResult) {
  if (result.error !== undefined) {
    throw new Error(result.error);
  }

  return result.application;
}
