"use client";

import { useState } from "react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { useDocumentAssignmentPage } from "@features/document-catalog/hooks/use-document-assignment-page";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function useDocumentCatalogAssignments({
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
  const [changes, setChanges] = useState<Record<string, DocumentAssignment>>({});
  const [removedAssignments, setRemovedAssignments] = useState<Record<string, DocumentAssignment>>({});
  const {
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
  } = useDocumentAssignmentPage({
    scope,
    institutionId,
    targetInstitutionId,
    currentId,
    initial,
    allowAssignments,
    savedDocument,
  });
  const assignmentInstitutionId = targetInstitutionId ?? institutionId;
  const [previousAssignmentInstitutionId, setPreviousAssignmentInstitutionId] = useState(assignmentInstitutionId);

  if (previousAssignmentInstitutionId !== assignmentInstitutionId) {
    setPreviousAssignmentInstitutionId(assignmentInstitutionId);
    setChanges({});
    setRemovedAssignments({});
    setAssociations(undefined);
    setAssociationsLoading(Boolean(currentId && allowAssignments && assignmentInstitutionId === institutionId));
    setPage(0);
    setReadError("");
  }

  const selectPath = async (item: { id: string; name: string }): Promise<void> => {
    if (!assignmentInstitutionId) {
      return;
    }

    const removed = removedAssignments[item.id];

    if (removed) {
      setChanges((previous) => ({ ...previous, [item.id]: { ...removed, active: true } }));
      setRemovedAssignments((previous) => {
        const next = { ...previous };
        delete next[item.id];

        return next;
      });
      setReadError("");

      return;
    }

    let existing: DocumentAssignment | undefined;

    try {
      if (currentId && initial?.canChangeInstitution !== true && assignmentInstitutionId === institutionId && institutionId) {
        const data = await fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
          scope,
          institutionId,
          `/${currentId}/training-paths?trainingPathId=${item.id}&size=20`,
        );
        existing = data.items[0];
      }

      setChanges((previous) => {
        if (previous[item.id]) {
          return { ...previous, [item.id]: { ...previous[item.id], active: true } };
        }

        return {
          ...previous,
          [item.id]: existing
            ? { ...existing, active: true }
            : {
                trainingPathId: item.id,
                trainingPathName: item.name,
                level: "AT_SUBMISSION",
                displayOrder: 0,
                active: true,
                specificInstructions: null,
              },
        };
      });
      setReadError("");
    } catch {
      setReadError("No se pudo confirmar la asignación. Volvé a seleccionar el trayecto.");
    }
  };

  function removePath(item: DocumentAssignment): void {
    setRemovedAssignments((previous) => ({ ...previous, [item.trainingPathId]: item }));
    setChanges((previous) => {
      if (item.id) {
        return { ...previous, [item.trainingPathId]: { ...item, active: false } };
      }

      const next = { ...previous };
      delete next[item.trainingPathId];

      return next;
    });
  }

  const associated = assignmentInstitutionId === institutionId ? (associations?.items ?? []) : [];
  const totalPages = assignmentInstitutionId === institutionId ? (associations?.totalPages ?? 0) : 0;
  const totalItems = assignmentInstitutionId === institutionId ? (associations?.totalItems ?? 0) : 0;
  const rows = [...associated.filter((item) => !changes[item.trainingPathId]), ...Object.values(changes)].filter(
    (item) => !removedAssignments[item.trainingPathId] && item.active,
  );

  return {
    changes,
    setChanges,
    setRemovedAssignments,
    assignmentInstitutionId,
    associations,
    page,
    pageSize,
    associationsLoading,
    readError,
    rows,
    totalItems,
    totalPages,
    selectPath,
    removePath,
    setPage,
    setPageSize,
    setAssociationsLoading,
  };
}
