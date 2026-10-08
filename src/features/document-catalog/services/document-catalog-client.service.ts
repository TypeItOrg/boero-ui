import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { parseHttpResponse } from "@common/utils/http-response-error.util";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { PlatformDocumentDefinition } from "@features/document-catalog/types/platform-document-definition.types";
import { getDocumentCatalogReadUrl } from "@features/document-catalog/utils/document-catalog-route.util";

export async function fetchDocumentCatalog<T>(scope: AcademicScope, institutionId: string, suffix: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${getDocumentCatalogReadUrl(scope, institutionId)}${suffix}`, {
    cache: "no-store",
    signal,
  });

  const payload = await parseHttpResponse<T>(response, "No se pudo consultar la documentación. Reintentá la consulta.");

  if (payload == null) {
    throw new Error("No se pudo consultar la documentación. Reintentá la consulta.");
  }

  return payload;
}

export async function fetchPlatformDocumentCatalog(
  filters: URLSearchParams,
  signal?: AbortSignal,
): Promise<PaginatedResponse<PlatformDocumentDefinition>> {
  const response = await fetch(`/api/admin/document-definitions?${filters}`, {
    cache: "no-store",
    signal,
  });

  const payload = await parseHttpResponse<PaginatedResponse<PlatformDocumentDefinition>>(
    response,
    "No se pudo consultar la documentación. Reintentá la consulta.",
  );

  if (payload == null) {
    throw new Error("No se pudo consultar la documentación. Reintentá la consulta.");
  }

  return payload;
}
