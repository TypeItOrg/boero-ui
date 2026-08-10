import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { ContextualSearchSummary } from "@features/contextual-search/types/contextual-search-summary.types";

type FetchContextualSearchOptions =
  | { scope: "platform"; search: string }
  | { scope: "institutional"; search: string; institutionId: string };

export async function fetchContextualSearch(
  options: FetchContextualSearchOptions,
  signal: AbortSignal,
): Promise<ContextualSearchSummary> {
  const params = new URLSearchParams({ search: options.search, limit: "5" });
  if (options.scope === "institutional") params.set("institutionId", options.institutionId);

  const response = await fetch(`/api/${options.scope === "platform" ? "admin" : "institutional"}/search?${params}`, {
    cache: "no-store",
    signal,
  });
  return parseHttpResponse<ContextualSearchSummary>(response, "No fue posible completar la búsqueda.");
}
