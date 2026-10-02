import { parseHttpResponse } from "@common/utils/http-response-error.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getDocumentCatalogReadUrl } from "@features/document-catalog/utils/document-catalog-route.util";

export async function fetchDocumentCatalog<T>(scope: AcademicScope, institutionId: string, suffix: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${getDocumentCatalogReadUrl(scope, institutionId)}${suffix}`, { cache: "no-store", signal });

  const payload = await parseHttpResponse<T>(response, "No se pudo consultar la documentación. Reintentá la consulta.");
  if (payload == null) {
    throw new Error("No se pudo consultar la documentación. Reintentá la consulta.");
  }

  return payload;
}
