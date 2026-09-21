"use client";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { EnrollmentApplicationApproveDialog } from "@features/enrollment-applications/components/enrollment-application-approve-dialog";
import { EnrollmentApplicationEmptyState } from "@features/enrollment-applications/components/enrollment-application-empty-state";
import { EnrollmentApplicationPagination } from "@features/enrollment-applications/components/enrollment-application-pagination";
import { EnrollmentApplicationRejectDialog } from "@features/enrollment-applications/components/enrollment-application-reject-dialog";
import { EnrollmentApplicationTableRow } from "@features/enrollment-applications/components/enrollment-application-table-row";
import { PlatformEnrollmentApplicationApproveDialog } from "@features/enrollment-applications/components/platform-enrollment-application-approve-dialog";
import { PlatformEnrollmentApplicationRejectDialog } from "@features/enrollment-applications/components/platform-enrollment-application-reject-dialog";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";

type EnrollmentApplicationTablePresentationProps = {
  data: PaginatedResponse<EnrollmentApplication>;
  page: number;
  size: number;
  status?: EnrollmentApplicationStatus;
  hasFilters?: boolean;
  canApprove: boolean;
  canReject: boolean;
  scope?: AcademicScope;
};

export function EnrollmentApplicationTablePresentation({
  data,
  page,
  size,
  status,
  hasFilters = Boolean(status),
  canApprove,
  canReject,
  scope,
}: EnrollmentApplicationTablePresentationProps): React.ReactElement {
  const router = useRouter();
  const { isPending: isNavigating } = useDataTableNavigation();
  const [applicationToApprove, setApplicationToApprove] = React.useState<EnrollmentApplication>();
  const [applicationToReject, setApplicationToReject] = React.useState<EnrollmentApplication>();

  function handleApproveDialogOpenChange(open: boolean): void {
    if (!open) {
      setApplicationToApprove(undefined);
    }
  }

  function handleRejectDialogOpenChange(open: boolean): void {
    if (!open) {
      setApplicationToReject(undefined);
    }
  }

  function handleResolved(): void {
    setApplicationToApprove(undefined);
    setApplicationToReject(undefined);
    router.refresh();
  }

  if (data.items.length === 0) {
    return <EnrollmentApplicationEmptyState hasFilter={hasFilters} isNavigating={isNavigating} size={size} totalItems={data.totalItems} />;
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <Table containerClassName="table-scrollbar" className="min-w-240">
          <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
            <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
              <TableHead className="w-16 pl-4">
                <span className="sr-only">Acciones</span>
              </TableHead>
              <TableHead>Estudiante</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Trayecto formativo</TableHead>
              <TableHead>Ciclo lectivo</TableHead>
              <TableHead>Fecha de solicitud</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Motivo de rechazo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((application) => (
              <EnrollmentApplicationTableRow
                key={application.applicationId}
                application={application}
                canApprove={canApprove && application.canApprove === true}
                canReject={canReject && application.canReject === true}
                onApprove={setApplicationToApprove}
                onReject={setApplicationToReject}
                detailHref={
                  scope === AcademicScope.ADMIN
                    ? `/admin/enrollment-applications/${application.institutionId}/${application.applicationId}`
                    : scope === AcademicScope.INSTITUTIONAL
                      ? `/enrollment-applications/${application.applicationId}`
                      : undefined
                }
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

      {applicationToApprove && scope === AcademicScope.ADMIN ? (
        <PlatformEnrollmentApplicationApproveDialog
          application={{
            institutionId: applicationToApprove.institutionId,
            applicationId: applicationToApprove.applicationId,
            applicantName: `${applicationToApprove.applicantFirstName} ${applicationToApprove.applicantLastName}`,
            studyPlanName: applicationToApprove.studyPlanName ?? applicationToApprove.trainingPathName ?? "—",
          }}
          open
          onOpenChange={handleApproveDialogOpenChange}
          onApproved={handleResolved}
        />
      ) : applicationToApprove ? (
        <EnrollmentApplicationApproveDialog
          application={{
            institutionId: applicationToApprove.institutionId,
            applicationId: applicationToApprove.applicationId,
            applicantName: `${applicationToApprove.applicantFirstName} ${applicationToApprove.applicantLastName}`,
            studyPlanName: applicationToApprove.studyPlanName ?? applicationToApprove.trainingPathName ?? "—",
          }}
          open
          onOpenChange={handleApproveDialogOpenChange}
          onApproved={handleResolved}
        />
      ) : null}

      {applicationToReject && scope === AcademicScope.ADMIN ? (
        <PlatformEnrollmentApplicationRejectDialog
          application={{
            institutionId: applicationToReject.institutionId,
            applicationId: applicationToReject.applicationId,
            applicantName: `${applicationToReject.applicantFirstName} ${applicationToReject.applicantLastName}`,
            studyPlanName: applicationToReject.studyPlanName ?? applicationToReject.trainingPathName ?? "—",
          }}
          open
          onOpenChange={handleRejectDialogOpenChange}
          onRejected={handleResolved}
        />
      ) : applicationToReject ? (
        <EnrollmentApplicationRejectDialog
          application={{
            institutionId: applicationToReject.institutionId,
            applicationId: applicationToReject.applicationId,
            applicantName: `${applicationToReject.applicantFirstName} ${applicationToReject.applicantLastName}`,
            studyPlanName: applicationToReject.studyPlanName ?? applicationToReject.trainingPathName ?? "—",
          }}
          open
          onOpenChange={handleRejectDialogOpenChange}
          onRejected={handleResolved}
        />
      ) : null}
    </div>
  );
}
