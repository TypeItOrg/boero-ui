"use client";

import { Loader2Icon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type { PaginationParams } from "@common/types/pagination-params.types";
import { InstitutionalSessionsPagination } from "@features/institutional-auth/components/institutional-sessions-pagination";
import type { ActiveSession } from "@features/institutional-auth/types/active-session.types";
import { formatSessionStartedAt } from "@features/institutional-auth/utils/session-started-at.util";
import { formatUserAgentLabel } from "@features/institutional-auth/utils/user-agent.util";

type InstitutionalSessionsTablePresentationProps = PaginationParams & {
  data: PaginatedResponse<ActiveSession>;
};

export function InstitutionalSessionsTablePresentation({ data, page, size }: InstitutionalSessionsTablePresentationProps): React.ReactElement {
  const { isPending, navigate } = useDataTableNavigation();

  if (data.items.length === 0) {
    return <div className="text-muted-foreground rounded-lg border p-8 text-center text-sm">No tenés sesiones activas.</div>;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isPending}>
        <Table containerClassName="table-scrollbar" className="min-w-160">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow>
              <TableHead>Iniciada</TableHead>
              <TableHead>Dirección IP</TableHead>
              <TableHead>Dispositivo</TableHead>
              <TableHead className="w-32 pr-4">
                <span className="sr-only">Sesión actual</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((session) => (
              <TableRow key={session.sessionId}>
                <TableCell className="text-muted-foreground tabular-nums">{formatSessionStartedAt(session.startedAt)}</TableCell>
                <TableCell className="text-muted-foreground tabular-nums">{session.ipAddress}</TableCell>
                <TableCell className="max-w-120">
                  <span className="block truncate" title={session.userAgent}>
                    {formatUserAgentLabel(session.userAgent)}
                  </span>
                </TableCell>
                <TableCell className="pr-4">{session.currentSession ? <Badge size="lg">Esta sesión</Badge> : null}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {isPending ? (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando sesiones" role="status" />
          </div>
        ) : null}
      </div>

      <InstitutionalSessionsPagination
        page={page}
        size={size}
        totalItems={data.totalItems}
        totalPages={data.totalPages}
        isPending={isPending}
        onPageChange={(nextPage) => navigate({ page: String(nextPage), size: String(size) })}
        onPageSizeChange={(nextSize) => navigate({ page: "0", size: nextSize })}
      />
    </div>
  );
}
