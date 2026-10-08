"use client";

import { useEffect, useState } from "react";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";

export function useDocumentDeliveryHistory(applicationId: string, scope: AcademicScope, requirementId: string) {
  const [page, setPage] = useState(0);
  const [retry, setRetry] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<{ items: DocumentDelivery[]; totalPages: number }>({
    items: [],
    totalPages: 0,
  });
  const url = `/api/enrollment-applications/${applicationId}/documents?scope=${scope}&requirementId=${requirementId}&page=${page}`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadHistory(): Promise<void> {
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });

        if (!response.ok) {
          throw new Error(DOCUMENT_MESSAGES.readFailed);
        }

        const value = (await response.json()) as { items: DocumentDelivery[]; totalPages: number };

        if (!controller.signal.aborted) {
          setHistory(value);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(DOCUMENT_MESSAGES.readFailed);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadHistory();

    return () => controller.abort();
  }, [url, retry]);

  function changePage(nextPage: number): void {
    setLoading(true);
    setError("");
    setPage(nextPage);
  }

  return { page, loading, error, history, setError, setLoading, setRetry, changePage };
}
