"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ImageIcon, Undo2Icon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";
import { FieldError } from "@common/components/ui/field";
import { FileDropzone, rejectFileDragOutside } from "@common/components/ui/file-dropzone";
import { FileUploadSelection } from "@common/components/ui/file-upload-selection";
import { InstitutionLogoImage } from "@features/institutions/components/institution-logo-manager";
import { INSTITUTION_ERROR_MESSAGES } from "@features/institutions/constants/error-messages.constants";
import { INSTITUTION_LOGO_MIME_TYPES } from "@features/institutions/constants/institution-logo.constants";
import type { InstitutionLogoChange } from "@features/institutions/types/institution-logo-change.types";
import { getInstitutionLogoFileError } from "@features/institutions/utils/institution-logo-form.util";
import { getInstitutionLogoUrl } from "@features/institutions/utils/institution-logo-url.util";

type InstitutionLogoFieldProps = {
  institutionId: string;
  institutionName: string;
  logoUrl: string | null;
  value: InstitutionLogoChange;
  onChange: (value: InstitutionLogoChange) => void;
  onError: (message: string) => void;
  error?: string;
  disabled?: boolean;
};

export function InstitutionLogoField({
  institutionId,
  institutionName,
  logoUrl,
  value,
  onChange,
  onError,
  error,
  disabled = false,
}: InstitutionLogoFieldProps): React.ReactElement {
  const id = useId();
  const selectRef = useRef<HTMLButtonElement>(null);
  const [preview, setPreview] = useState<string>();
  const currentUrl = getInstitutionLogoUrl(institutionId, logoUrl);
  const selectedFile = value.intent === "replace" ? value.file : undefined;
  const displayUrl = selectedFile ? preview : value.intent === "keep" ? currentUrl : undefined;
  const hasLogo = Boolean(selectedFile || (value.intent === "keep" && currentUrl));

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function selectFiles(files: File[], silent = false): void {
    if (disabled || files.length === 0) {
      return;
    }

    if (files.length !== 1) {
      if (!silent) {
        onError(INSTITUTION_ERROR_MESSAGES.LOGO_SINGLE_FILE);
      }
      return;
    }

    const file = files[0];
    const fileError = getInstitutionLogoFileError(file);
    if (fileError) {
      if (!silent) {
        onError(fileError);
      }
      return;
    }

    setPreview(URL.createObjectURL(file));
    onChange({ intent: "replace", file });
  }

  function removeSelection(): void {
    setPreview(undefined);
    onChange({ intent: currentUrl ? "remove" : "keep" });
    selectRef.current?.focus();
  }

  function undoChange(): void {
    setPreview(undefined);
    onChange({ intent: "keep" });
    selectRef.current?.focus();
  }

  return (
    <section
      aria-labelledby={`${id}-title`}
      className="bg-muted/25 min-w-0 rounded-xl border p-4 sm:p-5"
      onDragOver={rejectFileDragOutside}
      onDrop={rejectFileDragOutside}
    >
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
        <SectionHeader
          icon={ImageIcon}
          title="Logo institucional"
          titleId={`${id}-title`}
          description="Identidad visible en el acceso público de la institución."
        />
      </header>

      <div className="mt-5 space-y-3">
        <FileDropzone
          accept={INSTITUTION_LOGO_MIME_TYPES}
          inputLabel="Imagen del logo"
          selectLabel="Seleccionar imagen del logo"
          title="Subí el logo de tu institución"
          dragTitle="Soltá tu logo acá"
          description="Arrastrá tu logo acá o hacé clic para seleccionar una imagen."
          buttonRef={selectRef}
          disabled={disabled}
          error={error}
          errorId={`${id}-error`}
          onSelectFiles={selectFiles}
        />

        <FieldError id={`${id}-error`}>{error}</FieldError>

        {hasLogo ? (
          <FileUploadSelection
            label="Logo seleccionado"
            name={selectedFile?.name ?? "Logo actual"}
            file={selectedFile}
            removeLabel="Quitar logo"
            disabled={disabled}
            onRemove={removeSelection}
            preview={
              displayUrl ? (
                <InstitutionLogoImage
                  src={displayUrl}
                  alt={selectedFile ? "Vista previa del nuevo logo" : `Logo de ${institutionName}`}
                  className="h-full w-full object-contain"
                  compact
                />
              ) : (
                <ImageIcon aria-hidden="true" className="text-muted-foreground size-5" />
              )
            }
          />
        ) : null}

        {value.intent !== "keep" || error ? (
          <div aria-live="polite" aria-atomic="true" className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3">
            {selectedFile ? <span className="sr-only">Imagen seleccionada: {selectedFile.name}.</span> : null}
            <p className="text-muted-foreground text-sm">
              {value.intent === "remove"
                ? "El logo se quitará al guardar los cambios."
                : value.intent === "replace"
                  ? "El nuevo logo se aplicará al guardar los cambios."
                  : null}
            </p>
            {value.intent !== "keep" || error ? (
              <Button type="button" variant="ghost" disabled={disabled} onClick={undoChange}>
                <Undo2Icon aria-hidden="true" />
                Deshacer
              </Button>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
