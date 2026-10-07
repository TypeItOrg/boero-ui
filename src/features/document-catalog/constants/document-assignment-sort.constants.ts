import type { DocumentAssignmentSortField } from "@features/document-catalog/types/document-assignment-sort-field.types";

export const DOCUMENT_ASSIGNMENT_SORT_FIELDS = ["trainingPathName", "level", "active", "displayOrder"] as const;

export const DOCUMENT_ASSIGNMENT_SORT_LABELS: Readonly<Record<DocumentAssignmentSortField, string>> = {
  trainingPathName: "Trayecto",
  level: "Exigencia",
  active: "Asignación",
  displayOrder: "Orden",
};

export const DOCUMENT_ASSIGNMENT_API_SORT_FIELDS: Readonly<Record<DocumentAssignmentSortField, string>> = {
  trainingPathName: "trainingPath.name",
  level: "level",
  active: "active",
  displayOrder: "displayOrder",
};
