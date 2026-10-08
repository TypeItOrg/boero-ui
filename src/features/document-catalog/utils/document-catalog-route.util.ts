import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
export function getDocumentCatalogReadUrl(scope: AcademicScope, institutionId: string): string {
  return `/api/${scope}/institutions/${institutionId}/document-definitions`;
}
export function getDocumentCatalogPageUrl(scope: AcademicScope, institutionId: string): string {
  return scope === "admin" ? `/admin/documentation?institutionId=${institutionId}` : "/documentation";
}

export function getDocumentCatalogEditPageUrl(scope: AcademicScope, institutionId: string, documentId: string): string {
  return scope === "admin" ? `/admin/documentation/${documentId}/edit?institutionId=${institutionId}` : `/documentation/${documentId}/edit`;
}

export function getDocumentCatalogDetailPageUrl(scope: AcademicScope, institutionId: string, documentId: string): string {
  return scope === "admin" ? `/admin/documentation/${documentId}?institutionId=${institutionId}` : `/documentation/${documentId}`;
}
