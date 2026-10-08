"use client";

import { useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { parseHttpResponse } from "@common/utils/http-response-error.util";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";

export function useDocumentDeliveryHistory(applicationId: string, scope: AcademicScope, requirementId: string) {
  const [pagination, setPagination] = useState({ applicationId, requirementId, scope, page: 0 });

  const identityChanged = pagination.applicationId !== applicationId || pagination.requirementId !== requirementId || pagination.scope !== scope;

  if (identityChanged) {
    setPagination({ applicationId, requirementId, scope, page: 0 });
  }

  const page = identityChanged ? 0 : pagination.page;

  const query = useQuery({
    queryKey: ["document-delivery-history", scope, applicationId, requirementId, page],
    queryFn: async ({ signal }) => {
      const params = new URLSearchParams({ scope, requirementId, page: String(page) });

      const response = await fetch(`/api/enrollment-applications/${applicationId}/documents?${params}`, { cache: "no-store", signal });

      return parseHttpResponse<{ items: DocumentDelivery[]; totalPages: number }>(response, DOCUMENT_MESSAGES.readFailed);
    },
    retry: false,
    staleTime: 0,
    gcTime: 0,
  });

  return {
    page,
    loading: query.isFetching,
    error: query.isError && !query.isFetching ? DOCUMENT_MESSAGES.readFailed : "",
    history: query.data ?? { items: [], totalPages: 0 },
    retry: () => void query.refetch(),
    changePage: (nextPage: number) => setPagination((previous) => ({ ...previous, page: nextPage })),
  };
}
