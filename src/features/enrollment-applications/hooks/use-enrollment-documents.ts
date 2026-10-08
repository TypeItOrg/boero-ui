"use client";

import { useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { parseHttpResponse } from "@common/utils/http-response-error.util";

import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentDocumentDialog } from "@features/enrollment-applications/types/enrollment-document-dialog.types";
import type { EnrollmentDocumentsProps } from "@features/enrollment-applications/types/enrollment-documents-props.types";

export function useEnrollmentDocuments({ application, scope, disabled, onUploadBlockedChange }: EnrollmentDocumentsProps) {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState({ source: application.documents, documents: application.documents ?? [] });
  // Autosaves retain the source; a new server document snapshot replaces the local refresh.
  const documents = snapshot.source === application.documents ? snapshot.documents : (application.documents ?? []);
  const [dialog, setDialog] = useState<EnrollmentDocumentDialog>(null);
  const [feedback, setFeedback] = useState<{ requestUncertain: boolean; error?: string }>({ requestUncertain: false });
  const activityTriggerRef = useRef<HTMLButtonElement>(null);
  const editing = dialog?.kind === "edit" ? dialog : null;
  const activity = dialog?.kind === "activity" ? dialog : null;
  const requesting = dialog?.kind === "request";

  function editDocument(value: { requirement: DocumentRequirement; operation: "review" | "withdraw" } | null): void {
    if (disabled && value) {
      return;
    }

    onUploadBlockedChange?.("document-dialog", value !== null);

    if (value) {
      setDialog({ kind: "edit", ...value });

      return;
    }

    setDialog((previous) => (previous?.kind === "edit" ? null : previous));
  }

  function setActivity(value: { requirement: DocumentRequirement; initialTab: "deliveries" | "changes" } | null): void {
    if (value) {
      setDialog({ kind: "activity", ...value });

      return;
    }

    setDialog((previous) => (previous?.kind === "activity" ? null : previous));
  }

  function setRequesting(open: boolean): void {
    if (open) {
      setDialog({ kind: "request" });

      return;
    }

    setDialog((previous) => (previous?.kind === "request" ? null : previous));
  }

  function markRequestUncertain(): void {
    setFeedback({ requestUncertain: true });
  }

  async function refresh(): Promise<void> {
    const response = await fetch(`/api/enrollment-applications/${application.applicationId}/documents?scope=${scope}`, { cache: "no-store" });
    const refreshed = await parseHttpResponse<DocumentRequirement[]>(response, DOCUMENT_MESSAGES.readFailed);

    setSnapshot({ source: application.documents, documents: refreshed });
    setActivity(null);
    router.refresh();
  }

  async function reload(): Promise<void> {
    try {
      await refresh();
      setFeedback({ requestUncertain: false });
    } catch {
      setFeedback((previous) => ({ ...previous, error: DOCUMENT_MESSAGES.reloadFailed }));
    }
  }

  return {
    documents,
    requesting,
    editing,
    activity,
    ...feedback,
    activityTriggerRef,
    editDocument,
    setActivity,
    setRequesting,
    markRequestUncertain,
    refresh,
    reload,
  };
}
