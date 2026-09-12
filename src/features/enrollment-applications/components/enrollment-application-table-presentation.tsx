"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { EnrollmentApplicationApproveDialog } from "./enrollment-application-approve-dialog";
import { EnrollmentApplicationEmptyState } from "./enrollment-application-empty-state";
import { EnrollmentApplicationPagination } from "./enrollment-application-pagination";
import { EnrollmentApplicationRejectDialog } from "./enrollment-application-reject-dialog";
import { EnrollmentApplicationTableRow } from "./enrollment-application-table-row";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";

type EnrollmentApplicationTablePresentationProps = {
  data: PaginatedResponse<EnrollmentApplication>;
  page: number;
  size: number;
  status?: EnrollmentApplicationStatus;
  canApprove: boolean;
  canReject: boolean;
  scope?: "platform";
};

export function EnrollmentApplicationTablePresentation({
  data,
  page,
  size,
  status,
  canApprove,
  canReject,
  scope,
}: EnrollmentApplicationTablePresentationProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating } = useDataTableNavigation();
  const [applicationToApprove, setApplicationToApprove] = React.useState<EnrollmentApplication>();
  const [applicationToReject, setApplicationToReject] = React.useState<EnrollmentApplication>();

  function handleApproveDialogOpenChange(open: boolean): void {
    if (!open) setApplicationToApprove(undefined);
  }

  function handleRejectDialogOpenChange(open: boolean): void {
    if (!open) setApplicationToReject(undefined);
  }

  function handleResolved(): void {
    setApplicationToApprove(undefined);
    setApplicationToReject(undefined);
    router.refresh();
  }

  function handleRowClick(application: EnrollmentApplication): void {
    router.push(`/admin/enrollment-applications/${application.institutionId}/${application.applicationId}`);
  }

  if (data.items.length === 0) {
    return <EnrollmentApplicationEmptyState hasFilter={Boolean(status)} isNavigating={isNavigating} size={size} totalItems={data.totalItems} />;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-240">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
              <TableHead>Estudiante</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Plan de estudio</TableHead>
              <TableHead>Ciclo lectivo</TableHead>
              <TableHead>Fecha de solicitud</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Motivo de rechazo</TableHead>
              <TableHead className="w-16">
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((application) => (
              <EnrollmentApplicationTableRow
                key={application.applicationId}
                application={application}
                canApprove={canApprove}
                canReject={canReject}
                onApprove={setApplicationToApprove}
                onReject={setApplicationToReject}
                onRowClick={scope === "platform" ? handleRowClick : undefined}
              />
            ))}
          </TableBody>
        </Table>

        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <Loader2Icon className="text-muted-foreground size-5 animate-spin" aria-label="Cargando solicitudes" role="status" />
          </div>
        )}
      </div>

      <EnrollmentApplicationPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />

      {applicationToApprove ? (
        <EnrollmentApplicationApproveDialog
          application={applicationToApprove}
          open
          onOpenChange={handleApproveDialogOpenChange}
          onApproved={handleResolved}
        />
      ) : null}

      {applicationToReject ? (
        <EnrollmentApplicationRejectDialog
          application={applicationToReject}
          open
          onOpenChange={handleRejectDialogOpenChange}
          onRejected={handleResolved}
        />
      ) : null}
    </div>
  );
}
