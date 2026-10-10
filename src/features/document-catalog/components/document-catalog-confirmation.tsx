"use client";

import type { Dispatch, ReactElement, RefObject, SetStateAction } from "react";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogSaveConfirmation } from "@features/document-catalog/components/document-catalog-save-confirmation";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function DocumentCatalogConfirmation({
  scope,
  institutionId,
  confirmationData,
  currentId,
  impact,
  returnTo,
  setConfirmationData,
  onPendingChange,
  setSaveUncertainError,
  setConfirmationState,
  directState,
  saveButtonRef,
  setChanges,
  setRemovedAssignments,
  onSaved,
}: {
  scope: AcademicScope;
  institutionId: string;
  confirmationData: FormData;
  currentId: string | undefined;
  impact: { paths: number; drafts: number } | undefined;
  returnTo: string | undefined;
  setConfirmationData: Dispatch<SetStateAction<FormData | undefined>>;
  onPendingChange: ((pending: boolean) => void) | undefined;
  setSaveUncertainError: Dispatch<SetStateAction<string>>;
  setConfirmationState: Dispatch<SetStateAction<DocumentCatalogActionState | undefined>>;
  directState: DocumentCatalogActionState;
  saveButtonRef: RefObject<HTMLButtonElement | null>;
  setChanges: Dispatch<SetStateAction<Record<string, DocumentAssignment>>>;
  setRemovedAssignments: Dispatch<SetStateAction<Record<string, DocumentAssignment>>>;
  onSaved: ((document: DocumentDefinition) => void) | undefined;
}): ReactElement {
  return (
    <DocumentCatalogSaveConfirmation
      scope={scope}
      institutionId={institutionId}
      data={confirmationData}
      context={currentId && impact ? { id: currentId, impact } : undefined}
      returnTo={returnTo}
      onClose={() => setConfirmationData(undefined)}
      onPendingChange={onPendingChange}
      onUncertain={setSaveUncertainError}
      onResult={(result) => {
        setConfirmationState((previous) => ({
          ...result,
          document: result.document ?? previous?.document ?? directState.document,
        }));
      }}
      returnFocusRef={saveButtonRef}
      onSaved={(document) => {
        setConfirmationData(undefined);
        setChanges({});
        setRemovedAssignments({});
        onSaved?.(document);
      }}
    />
  );
}
