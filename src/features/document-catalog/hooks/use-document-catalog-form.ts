"use client";

import { useActionState, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { DialogFooter } from "@common/components/ui/dialog";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";

import { saveDocumentDefinition } from "@features/document-catalog/actions/save-document-definition.action";
import { useDocumentCatalogAssignments } from "@features/document-catalog/hooks/use-document-catalog-assignments";
import { useDocumentCatalogImpact } from "@features/document-catalog/hooks/use-document-catalog-impact";
import { documentDefinitionSchema } from "@features/document-catalog/schemas/document-catalog.schema";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentCatalogFormProps } from "@features/document-catalog/types/document-catalog-form-props.types";
import { DOCUMENT_FILE_CATEGORIES } from "@features/enrollment-applications/constants/documentation.constants";

const requiredDocumentFieldsSchema = documentDefinitionSchema.pick({
  name: true,
  allowedFormats: true,
});

export function useDocumentCatalogForm({
  scope,
  institutionId,
  institutionField,
  targetInstitutionId,
  copySourceInstitutionId,
  defaults,
  initial,
  onSaved,
  onCancel,
  onPendingChange,
  returnTo,
  allowAssignments = true,
  layout = "page",
}: DocumentCatalogFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initial?.name ?? defaults?.name ?? "");
  const [allowedFormats, setAllowedFormats] = useState<string[]>(
    () => initial?.allowedFormats ?? defaults?.allowedFormats ?? DOCUMENT_FILE_CATEGORIES.flatMap((category) => [...category.formats]),
  );
  const [confirmationData, setConfirmationData] = useState<FormData>();
  const [confirmationState, setConfirmationState] = useState<DocumentCatalogActionState>();
  const [saveUncertainError, setSaveUncertainError] = useState("");
  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const [directState, action, pending] = useActionState(async (previous: DocumentCatalogActionState, form: FormData) => {
    onPendingChange?.(true);

    try {
      const result = await saveDocumentDefinition(scope, institutionId, initial?.id, previous, form, returnTo);

      if (result.success && result.document) {
        setChanges({});
        setRemovedAssignments({});
        onSaved?.(result.document);
        router.refresh();
      }

      return result;
    } finally {
      onPendingChange?.(false);
    }
  }, {});
  const state = confirmationState ?? directState;
  const currentId = state.document?.id ?? initial?.id;
  const {
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
  } = useDocumentCatalogAssignments({
    scope,
    institutionId,
    targetInstitutionId,
    currentId,
    initial,
    allowAssignments,
    savedDocument: state.document,
  });
  const { impact, impactError } = useDocumentCatalogImpact(scope, institutionId, currentId, state.document);
  const disabled = pending || state.uncertain === true || Boolean(saveUncertainError);
  const hasValidRequiredFields = Boolean(institutionId) && requiredDocumentFieldsSchema.safeParse({ name, allowedFormats }).success;
  const formRef = useActionFormErrorFocus(state, pending || Boolean(confirmationData));
  const isDialog = layout === "dialog";
  const Footer = isDialog ? DialogFooter : ("div" as const);
  const hasFieldErrors = Object.keys(state.fieldErrors ?? {}).length > 0;

  return {
    formRef,
    action,
    isDialog,
    currentId,
    disabled,
    hasValidRequiredFields,
    impact,
    impactError,
    setConfirmationData,
    copySourceInstitutionId,
    scope,
    targetInstitutionId,
    institutionId,
    state,
    initial,
    changes,
    hasFieldErrors,
    saveUncertainError,
    institutionField,
    confirmationData,
    name,
    setName,
    defaults,
    allowedFormats,
    setAllowedFormats,
    allowAssignments,
    associationsLoading,
    assignmentInstitutionId,
    rows,
    removePath,
    selectPath,
    readError,
    setChanges,
    page,
    associations,
    totalItems,
    setAssociationsLoading,
    setPage,
    totalPages,
    pageSize,
    setPageSize,
    Footer,
    pending,
    onCancel,
    returnTo,
    router,
    saveButtonRef,
    onPendingChange,
    setSaveUncertainError,
    setConfirmationState,
    directState,
    setRemovedAssignments,
    onSaved,
  };
}
