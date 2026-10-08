"use client";

import { useState, type SetStateAction } from "react";

import { useQuery } from "@tanstack/react-query";

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
  allowAssignments,
  savedDocument,
}: {
  scope: AcademicScope;
  institutionId?: string;
  targetInstitutionId?: string;
  currentId?: string;
  allowAssignments: boolean;
  savedDocument?: DocumentDefinition;
}) {
  const assignmentInstitutionId = targetInstitutionId ?? institutionId;
  const identity = JSON.stringify([scope, institutionId, assignmentInstitutionId, currentId]);
  const [pagination, setPagination] = useState({ identity, page: 0, size: 20 });

  if (pagination.identity !== identity) {
    setPagination({ identity, page: 0, size: pagination.size });
  }

  const page = pagination.identity === identity ? pagination.page : 0;
  const enabled = Boolean(institutionId && currentId && allowAssignments && assignmentInstitutionId === institutionId);

  const query = useQuery({
    queryKey: ["document-catalog-assignments", scope, institutionId, currentId, savedDocument?.revision, page, pagination.size],
    enabled,
    queryFn: ({ signal }) =>
      fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
        scope,
        institutionId!,
        `/${currentId}/training-paths?page=${page}&size=${pagination.size}&active=true`,
        signal,
      ),
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  function setPage(value: SetStateAction<number>): void {
    setPagination((previous) => ({ ...previous, page: typeof value === "function" ? value(previous.page) : value }));
  }

  function setPageSize(value: SetStateAction<number>): void {
    setPagination((previous) => ({ ...previous, page: 0, size: typeof value === "function" ? value(previous.size) : value }));
  }

  return {
    associations: enabled ? query.data : undefined,
    page,
    setPage,
    pageSize: pagination.size,
    setPageSize,
    associationsLoading: enabled && query.isFetching,
    readError: enabled && query.isError ? "No se pudieron consultar los trayectos. Reintentá la consulta." : "",
  };
}
