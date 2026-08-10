import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { contextualSearchRequestSchema } from "@features/contextual-search/schemas/contextual-search-request.schema";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = contextualSearchRequestSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json({ message: "Los parámetros de búsqueda no son válidos." }, { status: 400 });
  }

  const params = new URLSearchParams({ search: parsed.data.search, limit: String(parsed.data.limit) });
  try {
    const response = await platformApiFetch(`/api/v1/admin/search?${params}`, { signal: request.signal });
    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "El servicio de búsqueda no está disponible." }, { status: 503 });
  }
}
