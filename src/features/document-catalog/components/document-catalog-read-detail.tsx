"use client";

import { useState, type ReactElement } from "react";

import { useQuery } from "@tanstack/react-query";
import { FileTextIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { SectionHeader } from "@common/components/section-header";
import { Badge } from "@common/components/ui/badge";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { Sort } from "@common/utils/sort-query.util";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogAssignmentList } from "@features/document-catalog/components/document-catalog-assignment-list";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignmentSortField } from "@features/document-catalog/types/document-assignment-sort-field.types";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function DocumentCatalogReadDetail({
  document,
  scope,
  institutionId,
  institutionName,
}: {
  document: DocumentDefinition;
  scope: AcademicScope;
  institutionId: string;
  institutionName?: string;
}): ReactElement {
  const [page, setPage] = useState(0);

  const [size, setSize] = useState(20);

  const [sort, setSort] = useState<Sort<DocumentAssignmentSortField>>({
    field: "displayOrder",
    direction: "asc",
  });

  function updateSort(nextSort: Sort<DocumentAssignmentSortField>): void {
    setSort(nextSort);
    setPage(0);
  }

  const query = useQuery({
    queryKey: ["document-catalog-associations", scope, institutionId, document.id, page, size, sort.field, sort.direction, true],
    queryFn: ({ signal }) =>
      fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
        scope,
        institutionId,
        `/${document.id}/training-paths?page=${page}&size=${size}&sortField=${sort.field}&sortDirection=${sort.direction}&active=true`,
        signal,
      ),
    placeholderData: (previousData, previousQuery) => {
      if (
        previousQuery?.queryKey[1] === scope &&
        previousQuery.queryKey[2] === institutionId &&
        previousQuery.queryKey[3] === document.id &&
        previousQuery.queryKey[8] === true
      ) {
        return previousData;
      }

      return undefined;
    },
    gcTime: 0,
  });

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <section aria-labelledby="document-info-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader
            icon={FileTextIcon}
            title="Información del documento"
            description="Estado, formatos permitidos e instrucciones generales."
            titleId="document-info-title"
          />
        </header>
        <dl className="grid gap-5 pt-5 sm:grid-cols-2">
          <div>
            <dt className={DETAIL_LABEL_CLASS_NAME}>Estado</dt>
            <dd className="mt-1">
              <Badge variant={document.active ? "success" : "secondary"}>{document.active ? "Activo" : "Inactivo"}</Badge>
            </dd>
          </div>
          <div>
            <dt className={DETAIL_LABEL_CLASS_NAME}>Formatos permitidos</dt>
            <dd className="mt-1 text-sm leading-relaxed">{formatDocumentFileCategories(document.allowedFormats)}</dd>
          </div>
          {institutionName ? (
            <div>
              <dt className={DETAIL_LABEL_CLASS_NAME}>Institución</dt>
              <dd className="mt-1 text-sm leading-relaxed break-words">{institutionName}</dd>
            </div>
          ) : null}
          <div className={institutionName ? undefined : "sm:col-span-2"}>
            <dt className={DETAIL_LABEL_CLASS_NAME}>Instrucciones generales</dt>
            <dd className="mt-1 max-w-prose text-sm leading-relaxed break-words whitespace-pre-wrap">
              <OptionalValue value={document.instructions} fallback="No especificadas" />
            </dd>
          </div>
        </dl>
      </section>
      <DocumentCatalogAssignmentList query={query} sort={sort} updateSort={updateSort} setPage={setPage} page={page} size={size} setSize={setSize} />
    </div>
  );
}
