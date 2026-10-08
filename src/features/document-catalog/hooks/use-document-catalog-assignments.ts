"use client";

import { useState, type SetStateAction } from "react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { useDocumentAssignmentPage } from "@features/document-catalog/hooks/use-document-assignment-page";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignmentDraft } from "@features/document-catalog/types/document-assignment-draft.types";
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
  const assignmentInstitutionId = targetInstitutionId ?? institutionId;
  const identity = JSON.stringify([scope, currentId, assignmentInstitutionId]);
  const [draft, setDraft] = useState<DocumentAssignmentDraft>({ identity, generation: 0, changes: {}, removed: {}, error: "" });

  if (draft.identity !== identity) {
    setDraft({ identity, generation: draft.generation + 1, changes: {}, removed: {}, error: "" });
  }

  const { changes, generation, removed: removedAssignments } = draft;

  const {
    associations,
    page,
    setPage,
    pageSize,
    setPageSize,
    associationsLoading,
    readError: pageError,
  } = useDocumentAssignmentPage({
    scope,
    institutionId,
    targetInstitutionId,
    currentId,
    allowAssignments,
    savedDocument,
  });

  function setChanges(value: SetStateAction<Record<string, DocumentAssignment>>): void {
    setDraft((previous) => ({ ...previous, changes: typeof value === "function" ? value(previous.changes) : value }));
  }

  function setRemovedAssignments(value: SetStateAction<Record<string, DocumentAssignment>>): void {
    setDraft((previous) => ({ ...previous, removed: typeof value === "function" ? value(previous.removed) : value }));
  }

  function setReadError(error: string): void {
    setDraft((previous) => (previous.identity === identity && previous.generation === generation ? { ...previous, error } : previous));
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

      setDraft((previous) => {
        if (previous.identity !== identity || previous.generation !== generation) {
          return previous;
        }

        const assignment = previous.changes[item.id] ?? existing;

        return {
          ...previous,
          error: "",
          changes: {
            ...previous.changes,
            [item.id]: assignment
              ? { ...assignment, active: true }
              : {
                  trainingPathId: item.id,
                  trainingPathName: item.name,
                  level: "AT_SUBMISSION",
                  displayOrder: 0,
                  active: true,
                  specificInstructions: null,
                },
          },
        };
      });
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
    readError: draft.error || pageError,
    rows,
    totalItems,
    totalPages,
    selectPath,
    removePath,
    setPage,
    setPageSize,
  };
}
