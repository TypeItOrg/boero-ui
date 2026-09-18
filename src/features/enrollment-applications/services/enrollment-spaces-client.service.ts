import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { EnrollmentCourseOption } from "@features/enrollment-applications/types/enrollment-course-option.types";

export async function fetchEnrollmentCourses(
  applicationId: string,
  params: { page?: number; size?: number; search?: string } = {},
): Promise<PaginatedResponse<EnrollmentCourseOption>> {
  const searchParams = new URLSearchParams({ page: String(params.page ?? 0), size: String(params.size ?? 50) });

  if (params.search) {
    searchParams.set("search", params.search);
  }

  const response = await fetch(`/api/enrollment-applications/${applicationId}/courses?${searchParams}`, { cache: "no-store" });

  return parseHttpResponse(response, ENROLLMENT_MESSAGES.FETCH_COURSES_FAILED);
}
