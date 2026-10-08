"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog, fetchPlatformDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import type { PlatformDocumentDefinition } from "@features/document-catalog/types/platform-document-definition.types";

export function useDocumentCatalogPage({
  scope,
  institutionId,
  page,
  size,
  search,
  active,
}: {
  scope: AcademicScope;
  institutionId?: string;
  page: number;
  size: number;
  search: string;
  active: string;
}) {
  const query = useQuery({
    queryKey: ["document-catalog", scope, institutionId, page, size, search, active],
    queryFn: ({ signal }) => {
      const filters = new URLSearchParams({ page: String(page), size: String(size), search });

      if (active !== "all") {
        filters.set("active", active);
      }

      if (scope === "admin") {
        if (institutionId) {
          filters.set("institutionId", institutionId);
        }

        return fetchPlatformDocumentCatalog(filters, signal);
      }

      if (!institutionId) {
        throw new Error("No se pudo identificar la institución.");
      }

      return fetchDocumentCatalog<PaginatedResponse<DocumentDefinition | PlatformDocumentDefinition>>(scope, institutionId, `?${filters}`, signal);
    },
    placeholderData: (previousData, previousQuery) => {
      if (previousQuery?.queryKey[1] === scope && previousQuery.queryKey[2] === institutionId) {
        return previousData;
      }

      return undefined;
    },
    gcTime: 0,
  });
  const [hasSettledInitialQuery, setHasSettledInitialQuery] = useState(false);

  if (!hasSettledInitialQuery && !query.isPending) {
    setHasSettledInitialQuery(true);
  }

  return { query, hasSettledInitialQuery };
}
