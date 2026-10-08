"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";

import { mutateDocument } from "@features/enrollment-applications/actions/documentation.actions";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";
import type { DocumentUploadProps } from "@features/enrollment-applications/types/document-upload-props.types";

export function useDocumentUpload({
  applicationId,
  scope,
  requirement,
  onSaved,
  autoSave,
  disabled: externallyDisabled,
  onBlockedChange,
}: DocumentUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [committed, setCommitted] = useState(false);
  const [submittedFile, setSubmittedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>();
  const [preview, setPreview] = useState<string>();
  const selectRef = useRef<HTMLButtonElement>(null);

  const [state, action, pending] = useActionState(async (previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
    const file = form.get("file");

    if (!(file instanceof File)) {
      return { error: DOCUMENT_MESSAGES.file };
    }

    setSubmittedFile(file);

    // A failed detail refresh must not upload the already-saved file again.
    if (!committed) {
      try {
        const result = await mutateDocument(scope, applicationId, "upload", requirement.id, previous, form);

        if (!result.success) {
          return result;
        }

        setCommitted(true);
      } catch {
        return { error: DOCUMENT_MESSAGES.failed };
      }
    }

    try {
      await onSaved();
    } catch {
      return { error: DOCUMENT_MESSAGES.refreshAfterUploadFailed };
    }

    setSelectedFile(null);
    setPreview(undefined);
    setCommitted(false);
    onBlockedChange?.(requirement.id, false);

    return { success: true };
  }, {});

  const showActionError = submittedFile !== null && (selectedFile === null || submittedFile === selectedFile);
  const error = fileError ?? (!pending && showActionError ? state.error : undefined);
  const disabled = pending || externallyDisabled;
  const errorId = `document-upload-error-${requirement.id}`;
  const fileUploadLabel = requirement.canReplace ? "Reemplazar archivo" : "Adjuntar archivo";
  const uploadLabel = autoSave ? "Reintentar" : fileUploadLabel;
  const savedFileLabel = committed ? "Actualizar detalle" : uploadLabel;
  const submitLabel = pending ? "Guardando…" : savedFileLabel;

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function uploadFile(file: File): void {
    const form = new FormData();

    form.set("file", file);
    startTransition(() => action(form));
  }

  function selectFiles(files: File[], silent = false): void {
    if (disabled || committed || files.length === 0) {
      return;
    }

    if (files.length !== 1) {
      if (!silent) {
        setFileError(DOCUMENT_MESSAGES.singleFile);
      }

      return;
    }

    const file = files[0];

    if (!requirement.allowedFormats.includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) {
      if (!silent) {
        setFileError(DOCUMENT_MESSAGES.file);
      }

      return;
    }

    setFileError(undefined);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    onBlockedChange?.(requirement.id, true);

    if (autoSave) {
      uploadFile(file);
    }
  }

  function removeSelection(): void {
    setSelectedFile(null);
    onBlockedChange?.(requirement.id, false);
    setSubmittedFile(null);
    setPreview(undefined);
    setFileError(undefined);
    selectRef.current?.focus();
  }

  return {
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
  };
}
