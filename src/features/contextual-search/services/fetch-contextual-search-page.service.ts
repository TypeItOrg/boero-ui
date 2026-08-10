import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicContextualSearchEntity } from "@features/contextual-search/types/academic-contextual-search-entity.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { ContextualSearchPage } from "@features/contextual-search/types/contextual-search-page.types";

export async function fetchContextualSearchPage(
  entityType: AcademicContextualSearchEntity,
  search: string,
  page: number,
  size: number,
): Promise<ContextualSearchPage> {
  const params = new URLSearchParams({ search, page: String(page), size: String(size) });
  const response = await platformApiFetch(`/api/v1/admin/search/${entityType}?${params}`);
  return parseHttpResponse<ContextualSearchPage>(response, "No fue posible cargar los resultados de búsqueda.");
}
