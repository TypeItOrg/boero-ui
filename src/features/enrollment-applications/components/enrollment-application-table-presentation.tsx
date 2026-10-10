"use client";

import { useState, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { Loader2Icon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { EnrollmentApplicationApproveDialog } from "@features/enrollment-applications/components/enrollment-application-approve-dialog";
import { EnrollmentApplicationEmptyState } from "@features/enrollment-applications/components/enrollment-application-empty-state";
import { EnrollmentApplicationPagination } from "@features/enrollment-applications/components/enrollment-application-pagination";
import { EnrollmentApplicationRejectDialog } from "@features/enrollment-applications/components/enrollment-application-reject-dialog";
import { EnrollmentApplicationTableRow } from "@features/enrollment-applications/components/enrollment-application-table-row";
import { PlatformEnrollmentApplicationApproveDialog } from "@features/enrollment-applications/components/platform-enrollment-application-approve-dialog";
import { PlatformEnrollmentApplicationRejectDialog } from "@features/enrollment-applications/components/platform-enrollment-application-reject-dialog";
import type { EnrollmentApplicationReviewSummary } from "@features/enrollment-applications/types/enrollment-application-review-summary.types";
import type { EnrollmentApplicationStatus } from "@features/enrollment-applications/types/enrollment-application-status.types";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";

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
}: EnrollmentApplicationTablePresentationProps): ReactElement {
  const router = useRouter();

  const { isPending: isNavigating } = useDataTableNavigation();

  const [applicationToApprove, setApplicationToApprove] = useState<EnrollmentApplication>();

  const [applicationToReject, setApplicationToReject] = useState<EnrollmentApplication>();

  const ApproveDialog = scope === AcademicScope.ADMIN ? PlatformEnrollmentApplicationApproveDialog : EnrollmentApplicationApproveDialog;

  const RejectDialog = scope === AcademicScope.ADMIN ? PlatformEnrollmentApplicationRejectDialog : EnrollmentApplicationRejectDialog;

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
                detailHref={getApplicationDetailHref(scope, application)}
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
        <ApproveDialog
          application={getReviewSummary(applicationToApprove)}
          open
          onOpenChange={handleApproveDialogOpenChange}
          onApproved={handleResolved}
        />
      ) : null}

      {applicationToReject ? (
        <RejectDialog
          application={getReviewSummary(applicationToReject)}
          open
          onOpenChange={handleRejectDialogOpenChange}
          onRejected={handleResolved}
        />
      ) : null}
    </div>
  );
}

function getApplicationDetailHref(scope: AcademicScope | undefined, application: EnrollmentApplication): string | undefined {
  switch (scope) {
    case AcademicScope.ADMIN:
      return `/admin/enrollment-applications/${application.institutionId}/${application.applicationId}`;
    case AcademicScope.INSTITUTIONAL:
      return `/enrollment-applications/${application.applicationId}`;
    default:
      return undefined;
  }
}

function getReviewSummary(application: EnrollmentApplication): EnrollmentApplicationReviewSummary {
  return {
    institutionId: application.institutionId,
    applicationId: application.applicationId,
    canApproveProvisionally: application.canApproveProvisionally,
    canConfirm: application.canConfirm,
    applicantName: `${application.applicantFirstName} ${application.applicantLastName}`,
    studyPlanName: application.studyPlanName ? formatStudyPlanLabel(application) : application.trainingPathName || "Sin trayecto formativo",
  };
}
