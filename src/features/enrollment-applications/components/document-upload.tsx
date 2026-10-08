"use client";

import type { ReactElement } from "react";

import { LoaderCircleIcon, UploadIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { FieldError } from "@common/components/ui/field";
import { FileDropzone, rejectFileDragOutside } from "@common/components/ui/file-dropzone";
import { FileUploadSelection } from "@common/components/ui/file-upload-selection";

import { DocumentFilePreview } from "@features/enrollment-applications/components/document-file-preview";
import { DocumentSavedFile } from "@features/enrollment-applications/components/document-saved-file";
import { useDocumentUpload } from "@features/enrollment-applications/hooks/use-document-upload";
import type { DocumentUploadProps } from "@features/enrollment-applications/types/document-upload-props.types";

export function DocumentUpload({
  applicationId,
  scope,
  requirement,
  onSaved,
  autoSave,
  disabled: externallyDisabled,
  onBlockedChange,
  onWithdraw,
  onCancel,
}: DocumentUploadProps): ReactElement {
  const {
    selectedFile,
    committed,
    preview,
    selectRef,
    state,
    action,
    pending,
    error,
    disabled,
    errorId,
    submitLabel,
    uploadFile,
    selectFiles,
    removeSelection,
  } = useDocumentUpload({
    applicationId,
    scope,
    requirement,
    onSaved,
    autoSave,
    disabled: externallyDisabled,
    onBlockedChange,
    onWithdraw,
    onCancel,
  });

  const savedStatusLabel = committed ? "Guardado; falta actualizar el detalle" : "Sin guardar";

  const selectionStatusLabel = pending ? "Guardando documento…" : savedStatusLabel;

  function renderAttachment(): ReactElement | null {
    if (selectedFile) {
      return (
        <>
          <FileUploadSelection
            label="Archivo seleccionado"
            name={selectedFile.name}
            file={selectedFile}
            preview={
              preview ? (
                <DocumentFilePreview key={preview} src={preview} name={selectedFile.name} contentType={selectedFile.type} compact />
              ) : undefined
            }
            previewAction={
              preview ? <DocumentFilePreview src={preview} name={selectedFile.name} contentType={selectedFile.type} iconOnly /> : undefined
            }
            statusLabel={selectionStatusLabel}
            removeLabel="Quitar archivo seleccionado"
            disabled={disabled}
            onRemove={committed ? undefined : removeSelection}
          />
          {!autoSave || (!pending && state.error) ? (
            <Button type="submit" size="lg" className="min-h-11 w-full" disabled={disabled}>
              {pending ? <LoaderCircleIcon className="animate-spin" /> : <UploadIcon />}
              {onCancel && !pending && !committed ? "Guardar entrega en nombre del aspirante" : submitLabel}
            </Button>
          ) : null}
        </>
      );
    }

    if (requirement.currentAttachment && !onCancel) {
      return (
        <DocumentSavedFile
          file={requirement.currentAttachment}
          applicationId={applicationId}
          scope={scope}
          disabled={disabled}
          statusLabel={autoSave ? "Guardado en el borrador" : undefined}
          onWithdraw={onWithdraw}
        />
      );
    }

    return null;
  }

  return (
    <form
      action={action}
      onSubmit={(event) => {
        event.preventDefault();

        if (disabled || !selectedFile) {
          return;
        }

        uploadFile(selectedFile);
      }}
      className="space-y-3"
      aria-label={`Adjuntar ${requirement.name}`}
      onDragOver={rejectFileDragOutside}
      onDrop={rejectFileDragOutside}
    >
      <FileDropzone
        accept={requirement.allowedFormats}
        inputLabel={`Archivo para ${requirement.name}`}
        selectLabel={`Seleccionar archivo para ${requirement.name}`}
        title={onCancel ? "Seleccioná el documento recibido" : "Subí tu documento"}
        dragTitle="Soltá tu archivo acá"
        description="Arrastrá tu archivo acá o hacé clic para seleccionarlo."
        buttonRef={selectRef}
        disabled={disabled || committed}
        error={error}
        errorId={errorId}
        onSelectFiles={selectFiles}
      />
      <FieldError id={errorId}>{error}</FieldError>
      {renderAttachment()}
      {onCancel ? (
        <Button type="button" variant="outline" size="lg" disabled={pending || committed} onClick={onCancel}>
          Cancelar carga asistida
        </Button>
      ) : null}
    </form>
  );
}
