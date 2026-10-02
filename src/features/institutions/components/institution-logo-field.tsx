"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";
import { ImageIcon, Undo2Icon, UploadIcon, XIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";
import { FieldError } from "@common/components/ui/field";
import { cn } from "@common/utils/cn.util";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLButtonElement>(null);
  const [preview, setPreview] = useState<string>();
  const [dragActive, setDragActive] = useState(false);
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

  function handleDragOver(event: DragEvent<HTMLButtonElement>): void {
    if (!event.dataTransfer.types.includes("Files")) {
      return;
    }

    event.preventDefault();
    const items = Array.from(event.dataTransfer.items).filter((item) => item.kind === "file");
    // Some browsers expose the MIME type only after the file has been dropped.
    const canDrop =
      !disabled &&
      (items.length === 0 || (items.length === 1 && (!items[0].type || INSTITUTION_LOGO_MIME_TYPES.some((type) => type === items[0].type))));

    event.dataTransfer.dropEffect = canDrop ? "copy" : "none";
    setDragActive(canDrop);
  }

  function rejectOutsideDrag(event: DragEvent<HTMLElement>): void {
    if (!event.defaultPrevented && event.dataTransfer.types.includes("Files")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = "none";
    }
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
      onDragOver={rejectOutsideDrag}
      onDrop={(event) => {
        if (event.dataTransfer.types.includes("Files")) {
          event.preventDefault();
          setDragActive(false);
        }
      }}
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
        <input
          ref={inputRef}
          id={`${id}-input`}
          type="file"
          accept={INSTITUTION_LOGO_MIME_TYPES.join(",")}
          disabled={disabled}
          className="hidden"
          aria-label="Imagen del logo"
          aria-invalid={Boolean(error)}
          onChange={(event) => {
            selectFiles(Array.from(event.currentTarget.files ?? []));
            event.currentTarget.value = "";
          }}
        />

        <Button
          ref={selectRef}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-label="Seleccionar imagen del logo"
          aria-describedby={`${id}-description${error ? ` ${id}-error` : ""}`}
          className={cn(
            "hover:bg-muted/40 h-auto min-h-44 w-full cursor-pointer flex-col gap-4 px-4 py-6 text-center whitespace-normal motion-reduce:transform-none motion-reduce:transition-none sm:px-6",
            dragActive && "border-primary bg-primary/5 hover:bg-primary/5",
            error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
          )}
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragActive(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragActive(false);
            selectFiles(Array.from(event.dataTransfer.files), true);
          }}
        >
          <span
            className={cn(
              "bg-primary/10 text-primary pointer-events-none flex size-12 items-center justify-center rounded-xl",
              error && "bg-destructive/10 text-destructive",
            )}
          >
            <UploadIcon aria-hidden="true" className="size-6" />
          </span>
          <span className="pointer-events-none space-y-1.5">
            <span className="text-foreground block text-sm font-medium">{dragActive ? "Soltá tu logo acá" : "Subí el logo de tu institución"}</span>
            <span id={`${id}-description`} className="text-muted-foreground block text-sm font-normal">
              Arrastrá tu logo acá o hacé clic para seleccionar una imagen.
            </span>
          </span>
        </Button>

        <FieldError id={`${id}-error`}>{error}</FieldError>

        {hasLogo ? (
          <ul aria-label="Logo seleccionado" className="min-w-0">
            <li className="bg-muted/50 flex min-w-0 items-center gap-3 rounded-lg p-3">
              <div className="bg-background flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5">
                {displayUrl ? (
                  <InstitutionLogoImage
                    src={displayUrl}
                    alt={selectedFile ? "Vista previa del nuevo logo" : `Logo de ${institutionName}`}
                    className="h-full w-full object-contain"
                    compact
                  />
                ) : (
                  <ImageIcon aria-hidden="true" className="text-muted-foreground size-5" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-foreground truncate text-sm font-medium" title={selectedFile?.name}>
                  {selectedFile?.name ?? "Logo actual"}
                </p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {selectedFile ? (
                    <>
                      <span className="font-normal whitespace-nowrap tabular-nums">{formatLogoFileSize(selectedFile.size)}</span>
                      {" · "}
                      <span className="whitespace-nowrap">Sin guardar</span>
                    </>
                  ) : (
                    "Guardado"
                  )}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-lg"
                className="hover:text-destructive size-11"
                disabled={disabled}
                aria-label="Quitar logo"
                onClick={removeSelection}
              >
                <XIcon aria-hidden="true" />
              </Button>
            </li>
          </ul>
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

function formatLogoFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const inMebibytes = bytes >= 1024 * 1024;
  const amount = bytes / (inMebibytes ? 1024 * 1024 : 1024);

  return `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 1 }).format(amount)} ${inMebibytes ? "MB" : "KB"}`;
}
