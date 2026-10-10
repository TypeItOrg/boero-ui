"use client";

import { useQuery } from "@tanstack/react-query";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function useDocumentCatalogImpact(
  scope: AcademicScope,
  institutionId: string | undefined,
  currentId: string | undefined,
  savedDocument: DocumentDefinition | undefined,
) {
  const query = useQuery({
    queryKey: ["document-catalog-impact", scope, institutionId, currentId, savedDocument?.revision],
    enabled: Boolean(institutionId && currentId),
    queryFn: async ({ signal }) => {
      const data = await fetchDocumentCatalog<DocumentDefinition>(scope, institutionId!, `/${currentId}`, signal);

      if (typeof data.affectedTrainingPaths !== "number" || typeof data.affectedDrafts !== "number") {
        throw new Error("No se pudo confirmar el alcance. Recargá antes de guardar.");
      }

      return { paths: data.affectedTrainingPaths, drafts: data.affectedDrafts };
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  return {
    impact: query.data,
    impactError: query.isError ? "No se pudo confirmar el alcance. Recargá antes de guardar." : "",
  };
}
