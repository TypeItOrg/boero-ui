"use client";

import * as React from "react";
import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { MyEnrollmentApplicationEmptyState } from "./my-enrollment-application-empty-state";
import { MyEnrollmentApplicationTableRow } from "./my-enrollment-application-table-row";
import { EnrollmentApplicationPagination } from "./enrollment-application-pagination";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";

type MyEnrollmentApplicationTablePresentationProps = {
  data: PaginatedResponse<EnrollmentApplication>;
  page: number;
  size: number;
  status?: EnrollmentApplicationStatus;
};

export function MyEnrollmentApplicationTablePresentation({
  data,
  page,
  size,
  status,
}: MyEnrollmentApplicationTablePresentationProps): React.ReactElement {
  const { isPending: isNavigating } = useDataTableNavigation();

  if (data.items.length === 0) {
    return <MyEnrollmentApplicationEmptyState hasFilter={Boolean(status)} isNavigating={isNavigating} size={size} totalItems={data.totalItems} />;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-150">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
              <TableHead>Plan de estudio</TableHead>
              <TableHead>Ciclo lectivo</TableHead>
              <TableHead>Fecha de solicitud</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Motivo de rechazo</TableHead>
              <TableHead className="w-32">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((application) => (
              <MyEnrollmentApplicationTableRow key={application.applicationId} application={application} />
            ))}
          </TableBody>
        </Table>

        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando inscripciones" role="status" />
          </div>
        )}
      </div>

      <EnrollmentApplicationPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />
    </div>
  );
}
