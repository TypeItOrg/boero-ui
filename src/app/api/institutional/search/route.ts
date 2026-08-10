import { createPassthroughResponse } from "@common/utils/create-passthrough-response.util";
import { institutionalContextualSearchRequestSchema } from "@features/contextual-search/schemas/contextual-search-request.schema";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = institutionalContextualSearchRequestSchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json({ message: "Los parámetros de búsqueda no son válidos." }, { status: 400 });
  }

  const params = new URLSearchParams({ search: parsed.data.search, limit: String(parsed.data.limit) });
  try {
    const response = await institutionalApiFetch(`/api/v1/institutions/${parsed.data.institutionId}/search?${params}`, {
      signal: request.signal,
    });
    return createPassthroughResponse(response);
  } catch {
    return Response.json({ message: "El servicio de búsqueda no está disponible." }, { status: 503 });
  }
}
