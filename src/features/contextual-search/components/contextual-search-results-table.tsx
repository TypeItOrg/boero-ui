import Link from "next/link";

import { Badge } from "@common/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import {
  CONTEXTUAL_SEARCH_STATUS_LABELS,
  hasPositiveContextualSearchStatus,
} from "@features/contextual-search/config/contextual-search.config";
import type { AcademicContextualSearchEntity } from "@features/contextual-search/types/academic-contextual-search-entity.types";
import type { ContextualSearchResult } from "@features/contextual-search/types/contextual-search-result.types";
import { getContextualSearchResultHref } from "@features/contextual-search/utils/contextual-search-route.util";

type ContextualSearchResultsTableProps = {
  entityType: AcademicContextualSearchEntity;
  items: ContextualSearchResult[];
};

export function ContextualSearchResultsTable({
  entityType,
  items,
}: ContextualSearchResultsTableProps): React.ReactElement {
  if (items.length === 0) {
    return (
      <div className="text-muted-foreground rounded-xl border border-dashed px-5 py-12 text-center text-sm">
        No hay resultados para esta búsqueda.
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Resultado</TableHead>
          <TableHead>Institución</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const resultHref = getContextualSearchResultHref("platform", entityType, item);
          return (
            <TableRow key={item.id}>
              <TableCell>
                <Link href={resultHref} className="font-medium hover:underline">
                  {item.title}
                </Link>
                {item.subtitle ? (
                  <span className="text-muted-foreground mt-0.5 block text-xs">{item.subtitle}</span>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{item.institutionName ?? "Plataforma"}</TableCell>
              <TableCell>
                {item.status ? (
                  <Badge variant={hasPositiveContextualSearchStatus(item.status) ? "success" : "secondary"}>
                    {CONTEXTUAL_SEARCH_STATUS_LABELS[item.status] ?? item.status}
                  </Badge>
                ) : (
                  "—"
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
