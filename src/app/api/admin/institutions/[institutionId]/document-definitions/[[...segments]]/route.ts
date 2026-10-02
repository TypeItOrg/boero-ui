import type { NextRequest } from "next/server";
import { readDocumentCatalog } from "@features/document-catalog/services/document-catalog-proxy.service";
export function GET(request: NextRequest, context: { params: Promise<{ institutionId: string; segments?: string[] }> }): Promise<Response> {
  return readDocumentCatalog(request, context, "admin");
}
