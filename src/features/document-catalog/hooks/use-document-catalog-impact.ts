"use client";

import { useEffect, useState } from "react";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function useDocumentCatalogImpact(
  scope: AcademicScope,
  institutionId: string | undefined,
  currentId: string | undefined,
  savedDocument: DocumentDefinition | undefined,
) {
  const [impact, setImpact] = useState<{ paths: number; drafts: number }>();
  const [impactError, setImpactError] = useState("");
  useEffect(() => {
    if (!institutionId || !currentId) {
      return;
    }

    const controller = new AbortController();
    void fetchDocumentCatalog<DocumentDefinition>(scope, institutionId, `/${currentId}`, controller.signal)
      .then((data) => {
        if (typeof data.affectedTrainingPaths !== "number" || typeof data.affectedDrafts !== "number") {
          throw new Error();
        }

        setImpact({ paths: data.affectedTrainingPaths, drafts: data.affectedDrafts });
        setImpactError("");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setImpactError("No se pudo confirmar el alcance. Recargá antes de guardar.");
        }
      });

    return () => controller.abort();
  }, [scope, institutionId, currentId, savedDocument]);

  return { impact, impactError };
}
