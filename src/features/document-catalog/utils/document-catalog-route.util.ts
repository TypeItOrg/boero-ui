import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
export function getDocumentCatalogReadUrl(scope: AcademicScope, institutionId: string): string {
  return `/api/${scope}/institutions/${institutionId}/document-definitions`;
}
export function getDocumentCatalogPageUrl(scope: AcademicScope, institutionId: string): string {
  return scope === "admin" ? `/admin/documentation?institutionId=${institutionId}` : "/documentation";
}
