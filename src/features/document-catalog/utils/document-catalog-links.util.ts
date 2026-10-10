import type { ReadonlyURLSearchParams } from "next/navigation";

import { appendReturnTo } from "@common/utils/return-to.util";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import type { PlatformDocumentDefinition } from "@features/document-catalog/types/platform-document-definition.types";
import { getDocumentCatalogDetailPageUrl, getDocumentCatalogEditPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";

export function getDocumentCatalogLinks(scope: AcademicScope, pathname: string, params: ReadonlyURLSearchParams) {
  function href(changes: Record<string, string | undefined>): string {
    const next = new URLSearchParams(params);

    for (const [key, value] of Object.entries(changes)) {
      if (value === undefined) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
    }

    return `${pathname}${next.size ? `?${next}` : ""}`;
  }

  function documentHref(item: DocumentDefinition | PlatformDocumentDefinition): string {
    return appendReturnTo(getDocumentCatalogDetailPageUrl(scope, item.institutionId, item.id), href({ returnTo: undefined }));
  }

  function editHref(item: DocumentDefinition | PlatformDocumentDefinition): string {
    return appendReturnTo(getDocumentCatalogEditPageUrl(scope, item.institutionId, item.id), href({ returnTo: undefined }));
  }

  return { href, documentHref, editHref };
}
