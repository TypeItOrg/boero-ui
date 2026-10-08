"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { cn } from "@common/utils/cn.util";

import { DocumentCatalogAssignmentSection } from "@features/document-catalog/components/document-catalog-assignment-section";
import { DocumentCatalogConfirmation } from "@features/document-catalog/components/document-catalog-confirmation";
import { DocumentCatalogDefinitionFields } from "@features/document-catalog/components/document-catalog-definition-fields";
import { DocumentCatalogFormFooter } from "@features/document-catalog/components/document-catalog-form-footer";
import { useDocumentCatalogForm } from "@features/document-catalog/hooks/use-document-catalog-form";
import type { DocumentCatalogFormProps } from "@features/document-catalog/types/document-catalog-form-props.types";

export function DocumentCatalogForm(props: DocumentCatalogFormProps): ReactElement {
  const { formRef, saveButtonRef, ...model } = useDocumentCatalogForm(props);

  return (
    <ActionForm
      ref={formRef}
      action={model.action}
      noValidate
      className={cn("flex min-h-0 flex-col", !model.isDialog && "gap-4")}
      onSubmit={(event) => {
        if (model.currentId || model.isDialog) {
          event.preventDefault();

          if (!model.disabled && model.hasValidRequiredFields && (!model.currentId || (model.impact && !model.impactError))) {
            model.setConfirmationData(new FormData(event.currentTarget));
          }
        }
      }}
    >
      <input type="hidden" name="copySourceInstitutionId" value={model.copySourceInstitutionId ?? ""} />
      <input
        type="hidden"
        name="targetInstitutionId"
        value={model.scope === "admin" && model.currentId ? (model.targetInstitutionId ?? model.institutionId ?? "") : ""}
      />
      <input type="hidden" name="revision" value={model.state.document?.revision ?? model.initial?.revision ?? ""} />
      <input type="hidden" name="assignments" value={JSON.stringify(Object.values(model.changes))} />
      <div className={cn("space-y-4", model.isDialog && "-mx-4 min-h-0 overflow-y-auto px-4 pb-5")}>
        {(model.state.error && !model.hasFieldErrors) || model.impactError || model.saveUncertainError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>{model.impactError || model.saveUncertainError || model.state.error}</AlertDescription>
          </Alert>
        ) : null}
        {model.state.success ? (
          <Alert variant="success" role="status">
            <AlertTitle>Documento guardado</AlertTitle>
            <AlertDescription>
              Trayectos afectados: {model.state.affectedTrainingPaths ?? 0}. Borradores sincronizados: {model.state.affectedDrafts ?? 0}.
            </AlertDescription>
          </Alert>
        ) : null}
        <DocumentCatalogDefinitionFields
          isDialog={model.isDialog}
          initial={model.initial}
          institutionField={model.institutionField}
          disabled={model.disabled}
          confirmationData={model.confirmationData}
          state={model.state}
          name={model.name}
          setName={model.setName}
          defaults={model.defaults}
          allowedFormats={model.allowedFormats}
          setAllowedFormats={model.setAllowedFormats}
        />
        {model.allowAssignments ? (
          <DocumentCatalogAssignmentSection
            associationsLoading={model.associationsLoading}
            scope={model.scope}
            assignmentInstitutionId={model.assignmentInstitutionId}
            disabled={model.disabled}
            rows={model.rows}
            removePath={model.removePath}
            selectPath={model.selectPath}
            readError={model.readError}
            setChanges={model.setChanges}
            page={model.page}
            associations={model.associations}
            totalItems={model.totalItems}
            setPage={model.setPage}
            currentId={model.currentId}
            totalPages={model.totalPages}
            pageSize={model.pageSize}
            setPageSize={model.setPageSize}
          />
        ) : null}
      </div>
      <DocumentCatalogFormFooter
        Footer={model.Footer}
        isDialog={model.isDialog}
        pending={model.pending}
        onCancel={model.onCancel}
        returnTo={model.returnTo}
        router={model.router}
        saveButtonRef={saveButtonRef}
        disabled={model.disabled}
        hasValidRequiredFields={model.hasValidRequiredFields}
        currentId={model.currentId}
        impact={model.impact}
        impactError={model.impactError}
      />
      {model.confirmationData && model.institutionId ? (
        <DocumentCatalogConfirmation
          scope={model.scope}
          institutionId={model.institutionId}
          confirmationData={model.confirmationData}
          currentId={model.currentId}
          impact={model.impact}
          returnTo={model.returnTo}
          setConfirmationData={model.setConfirmationData}
          onPendingChange={model.onPendingChange}
          setSaveUncertainError={model.setSaveUncertainError}
          setConfirmationState={model.setConfirmationState}
          directState={model.directState}
          saveButtonRef={saveButtonRef}
          setChanges={model.setChanges}
          setRemovedAssignments={model.setRemovedAssignments}
          onSaved={model.onSaved}
        />
      ) : null}
    </ActionForm>
  );
}
