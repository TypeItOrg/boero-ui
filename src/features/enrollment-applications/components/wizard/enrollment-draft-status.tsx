"use client";

import type { ReactElement } from "react";

import { AlertCircleIcon, CheckCircle2Icon, FileClockIcon, Loader2Icon } from "lucide-react";

import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";

export function EnrollmentDraftStatus({
  saving,
  saveError,
  pendingInstrumentGroups,
  documentsBlocked,
}: {
  saving: boolean;
  saveError: string | undefined;
  pendingInstrumentGroups: string[];
  documentsBlocked: boolean;
}): ReactElement {
  function renderSaveStatus(): ReactElement | null {
    if (saving) {
      return (
        <>
          <Loader2Icon className="text-primary size-4 animate-spin" />
          <span>Guardando cambios…</span>
        </>
      );
    }

    if (saveError) {
      return (
        <span className="text-destructive flex items-center gap-1">
          <AlertCircleIcon className="size-4" />
          <span>No se pudo guardar: {saveError}</span>
        </span>
      );
    }

    if (pendingInstrumentGroups.length > 0) {
      return <span>{ENROLLMENT_MESSAGES.COURSE_INSTRUMENT_DRAFT_PENDING}</span>;
    }

    if (documentsBlocked) {
      return <span>{ENROLLMENT_MESSAGES.DOCUMENTS_DRAFT_PENDING}</span>;
    }

    return (
      <>
        <CheckCircle2Icon className="size-4 text-emerald-500" />
        <span>Borrador guardado</span>
      </>
    );
  }

  return (
    <div className="bg-muted/25 rounded-xl border p-4 sm:p-6">
      <div className="flex items-start gap-3.5">
        <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
          <FileClockIcon className="size-5" aria-hidden="true" />
        </div>
        <div className="flex flex-col justify-center gap-1">
          <p className="font-heading text-sm font-medium">Solicitud en borrador</p>
          <div className="text-muted-foreground flex items-center gap-2 text-xs sm:text-sm" aria-live="polite" aria-atomic="true">
            {renderSaveStatus()}
          </div>
        </div>
      </div>
    </div>
  );
}
