import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type AcademicOptionResource = "training-paths" | "academic-spaces";
type AcademicOption = TrainingPath | AcademicSpace;
type AcademicOptionActiveFilter = boolean | "all";

export async function fetchAcademicOptionPage<TItem extends AcademicOption>(
  resource: AcademicOptionResource,
  scope: AcademicScope,
  institutionId: string,
  { page, search, signal, size }: AsyncDropdownFetchPageInput,
  options: { active?: AcademicOptionActiveFilter } = {},
): Promise<AsyncDropdownPage<TItem>> {
  const searchParams = new URLSearchParams({
    institutionId,
    page: String(page),
    search,
    size: String(size),
  });
  if (options.active !== undefined) searchParams.set("active", String(options.active));
  const response = await fetch(`/api/${scope}/academic/options/${resource}?${searchParams}`, { signal });
  const data = await parseHttpResponse<{ items: TItem[]; page: number; totalPages: number }>(
    response,
    "No se pudieron cargar las opciones académicas.",
  );
  return {
    items: data.items,
    nextPage: data.page + 1 < data.totalPages ? data.page + 1 : null,
  };
}
