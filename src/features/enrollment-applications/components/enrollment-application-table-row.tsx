"use client";

import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";
import { formatEnrollmentApplicationDate } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { EnrollmentApplicationStatusBadge } from "@features/enrollment-applications/components/enrollment-application-status-badge";

type EnrollmentApplicationTableRowProps = {
  application: EnrollmentApplication;
  canApprove: boolean;
  canReject: boolean;
  onApprove: (application: EnrollmentApplication) => void;
  onReject: (application: EnrollmentApplication) => void;
  detailHref?: string;
};

export function EnrollmentApplicationTableRow({
  application,
  canApprove,
  canReject,
  onApprove,
  onReject,
  detailHref,
}: EnrollmentApplicationTableRowProps): React.ReactElement {
  const isPendingEvaluation = application.status === ENROLLMENT_APPLICATION_STATUS.SUBMITTED;
  const canResolve = isPendingEvaluation && (canApprove || canReject);
  const hasActions = Boolean(detailHref) || canResolve;
  const row = (
    <TableRow className="h-12">
      <TableCell className="w-16 pl-4">
        {hasActions ? (
          <div className="flex justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Abrir acciones de ${application.applicantFirstName} ${application.applicantLastName}`}
                >
                  <EllipsisVerticalIcon />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 p-1.5">
                {detailHref ? (
                  <DropdownMenuItem asChild>
                    <ReturnToLink href={detailHref} className="px-2.5 py-1.5">
                      Ver detalle
                    </ReturnToLink>
                  </DropdownMenuItem>
                ) : null}
                {canResolve && canApprove ? (
                  <DropdownMenuItem className="px-2.5 py-1.5" onSelect={() => onApprove(application)}>
                    Aprobar inscripción
                  </DropdownMenuItem>
                ) : null}
                {canResolve && canReject ? (
                  <DropdownMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => onReject(application)}>
                    Rechazar inscripción
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </TableCell>
      <TableCell className="font-medium">
        {application.applicantLastName}, {application.applicantFirstName}
      </TableCell>
      <TableCell>{application.applicantDocumentNumber}</TableCell>
      <TableCell>{application.studyPlanName}</TableCell>
      <TableCell>{application.academicYear}</TableCell>
      <TableCell className="text-muted-foreground">{formatEnrollmentApplicationDate(application.createdAt)}</TableCell>
      <TableCell>
        <EnrollmentApplicationStatusBadge status={application.status} />
      </TableCell>
      <TableCell className="max-w-72">
        {application.status === ENROLLMENT_APPLICATION_STATUS.REJECTED && application.rejectionReason ? (
          <span className="text-destructive">{application.rejectionReason}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>
    </TableRow>
  );

  if (!hasActions) {
    return row;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 p-1.5">
        {detailHref ? (
          <ContextMenuItem asChild>
            <ReturnToLink href={detailHref} className="px-2.5 py-1.5">
              Ver detalle
            </ReturnToLink>
          </ContextMenuItem>
        ) : null}
        {canResolve && canApprove ? (
          <ContextMenuItem className="px-2.5 py-1.5" onSelect={() => onApprove(application)}>
            Aprobar inscripción
          </ContextMenuItem>
        ) : null}
        {canResolve && canReject ? (
          <ContextMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => onReject(application)}>
            Rechazar inscripción
          </ContextMenuItem>
        ) : null}
      </ContextMenuContent>
    </ContextMenu>
  );
}
