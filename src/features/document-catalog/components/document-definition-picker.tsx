"use client";

import * as React from "react";

import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

import { FormField } from "@features/academic/components/academic-form-controls";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

export function DocumentDefinitionPicker({
  scope,
  institutionId,
  trainingPathId,
  applicationId,
  forTrainingPathCreation = false,
  value,
  onSelect,
  disabled = false,
}: {
  scope: AcademicScope;
  institutionId: string;
  trainingPathId?: string;
  applicationId?: string;
  forTrainingPathCreation?: boolean;
  value?: DocumentDefinition;
  onSelect: (item: DocumentDefinition) => void;
  disabled?: boolean;
}): React.ReactElement {
  const fetchPage = React.useCallback(
    async ({ page, search, size, signal }: { page: number; search: string; size: number; signal?: AbortSignal }) => {
      const query = new URLSearchParams({ page: String(page), size: String(size), search, active: "true" });
      if (forTrainingPathCreation) {
        query.set("forTrainingPathCreation", "true");
      }
      if (applicationId) {
        query.set("applicationId", applicationId);
      }
      if (trainingPathId) {
        query.set("trainingPathId", trainingPathId);
      }

      const data = await fetchDocumentCatalog<PaginatedResponse<DocumentDefinition>>(scope, institutionId, `?${query}`, signal);

      return { items: data.items, nextPage: data.page + 1 < data.totalPages ? data.page + 1 : null };
    },
    [scope, institutionId, trainingPathId, applicationId, forTrainingPathCreation],
  );
  return (
    <FormField name="document-definition" label="Documento del catálogo" required>
      <AsyncDropdown<DocumentDefinition>
        id="document-definition"
        aria-required
        disabled={disabled}
        value={value?.id}
        defaultOption={value ? { value: value.id, label: value.name } : undefined}
        queryKey={["document-definitions", scope, institutionId, trainingPathId, applicationId, forTrainingPathCreation]}
        fetchPage={fetchPage}
        getItemValue={(item) => item.id}
        getItemLabel={(item) => item.name}
        onValueChange={(_, item) => {
          if (item) {
            onSelect(item);
          }
        }}
        placeholder="Buscar documento del catálogo"
        searchPlaceholder="Buscar por nombre…"
      />
    </FormField>
  );
}
