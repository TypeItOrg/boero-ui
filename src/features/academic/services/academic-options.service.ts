import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicOptionResource = "training-paths" | "academic-spaces" | "study-plans" | "academic-years";
type AcademicOption = { id: string };
type AcademicOptionActiveFilter = boolean | "all";

export async function fetchAcademicOptionPage<TItem extends AcademicOption>(
  resource: AcademicOptionResource,
  scope: AcademicScope,
  institutionId: string,
  { page, search, signal, size }: AsyncDropdownFetchPageInput,
  options: { active?: AcademicOptionActiveFilter; status?: "DRAFT" | "ACTIVE" | "INACTIVE" } = {},
): Promise<AsyncDropdownPage<TItem>> {
  const searchParams = new URLSearchParams({
    institutionId,
    page: String(page),
    search,
    size: String(size),
  });
  if (options.active !== undefined) searchParams.set("active", String(options.active));
  if (options.status) searchParams.set("status", options.status);
  const response = await fetch(`/api/${scope}/academic/options/${resource}?${searchParams}`, {
    cache: "no-store",
    signal,
  });
  const data = await parseHttpResponse<{ items: TItem[]; page: number; totalPages: number }>(
    response,
    "No se pudieron cargar las opciones académicas.",
  );
  return {
    items: data.items,
    nextPage: data.page + 1 < data.totalPages ? data.page + 1 : null,
  };
}
