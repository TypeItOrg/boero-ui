import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type CourseOptionResource = "teachers" | "spaces";
export type CourseTeacherOption = { id: string; fullName: string };
type CourseSpaceOption = {
  id: string;
  name: string;
  type: string;
  format: string;
};
type CourseOption = CourseTeacherOption | CourseSpaceOption;

async function fetchCourseOptionPage<TItem extends CourseOption>(
  resource: CourseOptionResource,
  scope: AcademicScope,
  institutionId: string,
  { page, search, signal, size }: AsyncDropdownFetchPageInput,
  params: { studyPlanId?: string } = {},
): Promise<AsyncDropdownPage<TItem>> {
  const searchParams = new URLSearchParams({
    institutionId,
    page: String(page),
    search,
    size: String(size),
  });
  if (params.studyPlanId) searchParams.set("studyPlanId", params.studyPlanId);
  const response = await fetch(`/api/${scope}/academic/courses-options/${resource}?${searchParams}`, {
    cache: "no-store",
    signal,
  });
  const data = await parseHttpResponse<TItem[] | { items: TItem[]; page: number; totalPages: number }>(
    response,
    "No se pudieron cargar las opciones del curso.",
  );
  const items = Array.isArray(data) ? data : data.items;
  const pageNumber = Array.isArray(data) ? 0 : data.page;
  const totalPages = Array.isArray(data) ? 1 : data.totalPages;
  return {
    items,
    nextPage: pageNumber + 1 < totalPages ? pageNumber + 1 : null,
  };
}

export function fetchCourseTeacherOptions(
  scope: AcademicScope,
  institutionId: string,
  input: AsyncDropdownFetchPageInput,
): Promise<AsyncDropdownPage<CourseTeacherOption>> {
  return fetchCourseOptionPage<CourseTeacherOption>("teachers", scope, institutionId, input);
}

export function fetchCourseSpaceOptions(
  scope: AcademicScope,
  institutionId: string,
  studyPlanId: string,
  input: AsyncDropdownFetchPageInput,
): Promise<AsyncDropdownPage<CourseSpaceOption>> {
  return fetchCourseOptionPage<CourseSpaceOption>("spaces", scope, institutionId, input, {
    studyPlanId,
  });
}
