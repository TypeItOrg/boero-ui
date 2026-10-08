"use client";

import { useEffect, useState } from "react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function useDocumentAssignmentPage({
  scope,
  institutionId,
  targetInstitutionId,
  currentId,
  initial,
  allowAssignments,
  savedDocument,
}: {
  scope: AcademicScope;
  institutionId?: string;
  targetInstitutionId?: string;
  currentId?: string;
  initial?: DocumentDefinition;
  allowAssignments: boolean;
  savedDocument?: DocumentDefinition;
}) {
  const assignmentInstitutionId = targetInstitutionId ?? institutionId;
  const [associations, setAssociations] = useState<PaginatedResponse<DocumentAssignment>>();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [associationsLoading, setAssociationsLoading] = useState(Boolean(initial && allowAssignments));
  const [readError, setReadError] = useState("");
  useEffect(() => {
    if (!institutionId || !currentId || !allowAssignments || assignmentInstitutionId !== institutionId) {
      return;
    }

    const controller = new AbortController();
    void fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
      scope,
      institutionId,
      `/${currentId}/training-paths?page=${page}&size=${pageSize}&active=true`,
      controller.signal,
    )
      .then((data) => {
        setAssociations(data);
        setAssociationsLoading(false);

        setReadError("");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setReadError("No se pudieron consultar los trayectos. Reintentá la consulta.");
          setAssociationsLoading(false);
        }
      });

    return () => controller.abort();
  }, [scope, institutionId, assignmentInstitutionId, currentId, page, pageSize, allowAssignments, savedDocument]);

  return {
    associations,
    setAssociations,
    page,
    setPage,
    pageSize,
    setPageSize,
    associationsLoading,
    setAssociationsLoading,
    readError,
    setReadError,
  };
}
