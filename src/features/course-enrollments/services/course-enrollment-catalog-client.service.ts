import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { toAsyncDropdownPage } from "@common/utils/to-async-dropdown-page.util";

import { COURSE_ENROLLMENT_MESSAGES } from "@features/course-enrollments/constants/course-enrollment.constants";

export async function fetchCatalog<T>(resource: string, input: AsyncDropdownFetchPageInput): Promise<AsyncDropdownPage<T>> {
  const params = new URLSearchParams({
    page: String(input.page),
    size: String(input.size),
    search: input.search ?? "",
  });

  const response = await fetch(`/api/${resource}?${params}`, {
    cache: "no-store",
    signal: input.signal,
  });

  return toAsyncDropdownPage(await parseHttpResponse<PaginatedResponse<T>>(response, COURSE_ENROLLMENT_MESSAGES.CATALOG_FAILED));
}
