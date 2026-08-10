import { SearchIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import { ContextualSearchPagination } from "@features/contextual-search/components/contextual-search-pagination";
import { ContextualSearchResultsTable } from "@features/contextual-search/components/contextual-search-results-table";
import {
  CONTEXTUAL_SEARCH_PRESENTATION,
  isAcademicSearchEntity,
} from "@features/contextual-search/config/contextual-search.config";
import { fetchContextualSearchPage } from "@features/contextual-search/services/fetch-contextual-search-page.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = { title: "Resultados de búsqueda" };

export default async function AdminSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const rawParams = await searchParams;
  const requestedType = typeof rawParams.type === "string" ? rawParams.type : undefined;
  const entityType = isAcademicSearchEntity(requestedType) ? requestedType : undefined;
  const pagination = parsePaginationQuery(rawParams);
  const data =
    entityType && pagination.search.length >= 2
      ? await fetchContextualSearchPage(entityType, pagination.search, pagination.page, pagination.size)
      : null;
  const title = entityType ? CONTEXTUAL_SEARCH_PRESENTATION[entityType].plural : "Resultados de búsqueda";
  const hasInvalidType = requestedType !== undefined && entityType === undefined;

  return (
    <PlatformPageShell
      title={title}
      description={
        pagination.search ? (
          <>Coincidencias para “{pagination.search}” en todas las instituciones.</>
        ) : (
          "Realizá una búsqueda desde la barra superior."
        )
      }
      breadcrumb={<PlatformBreadcrumb segmentLabels={{ search: "Búsqueda" }} />}
    >
      {data && entityType ? (
        <DataTableNavigationProvider>
          <ContextualSearchResultsTable entityType={entityType} items={data.items} />
          <ContextualSearchPagination
            page={data.page}
            size={data.size}
            totalItems={data.totalItems}
            totalPages={data.totalPages}
          />
        </DataTableNavigationProvider>
      ) : (
        <div className="text-muted-foreground flex min-h-64 flex-col items-center justify-center gap-3 rounded-xl border border-dashed text-center text-sm">
          <span className="bg-muted flex size-11 items-center justify-center rounded-full">
            <SearchIcon className="size-5" />
          </span>
          <p>
            {hasInvalidType
              ? "El tipo de resultado solicitado no es válido."
              : "Usá la búsqueda superior para encontrar registros."}
          </p>
        </div>
      )}
    </PlatformPageShell>
  );
}
