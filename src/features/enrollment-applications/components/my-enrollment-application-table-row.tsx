"use client";

import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import * as React from "react";
import { EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { EnrollmentApplication } from "@features/enrollment-applications/types/enrollment-application.types";
import { formatEnrollmentApplicationDate } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { EnrollmentApplicationStatusBadge } from "@features/enrollment-applications/components/enrollment-application-status-badge";
import { EnrollmentCancelDialog } from "@features/enrollment-applications/components/enrollment-cancel-dialog";
import { useRouter } from "next/navigation";

type MyEnrollmentApplicationTableRowProps = {
  application: EnrollmentApplication;
};

export function MyEnrollmentApplicationTableRow({ application }: MyEnrollmentApplicationTableRowProps): React.ReactElement {
  const router = useRouter();
  const [isCancelOpen, setIsCancelOpen] = React.useState(false);

  const canCancel = application.status === ENROLLMENT_APPLICATION_STATUS.DRAFT;
  const detailHref = `/my-enrollment-applications/${application.applicationId}`;
  const detailLabel = canCancel ? "Continuar inscripción" : "Ver detalle";

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <TableRow className="hover:bg-muted/50 h-11 border-b transition-colors">
            <TableCell className="w-16 pl-4">
              <div className="flex justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${application.studyPlanName}`} disabled={isCancelOpen}>
                      <EllipsisVerticalIcon />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-44 p-1.5">
                    <DropdownMenuItem asChild>
                      <ReturnToLink href={detailHref} className="px-2.5 py-1.5">
                        {detailLabel}
                      </ReturnToLink>
                    </DropdownMenuItem>
                    {canCancel ? (
                      <DropdownMenuItem
                        variant="destructive"
                        className="px-2.5 py-1.5"
                        onSelect={() => setIsCancelOpen(true)}
                        disabled={isCancelOpen}
                      >
                        Cancelar
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
            <TableCell className="font-medium">{application.studyPlanName}</TableCell>
            <TableCell>{application.academicYear}</TableCell>
            <TableCell className="text-muted-foreground">{formatEnrollmentApplicationDate(application.createdAt)}</TableCell>
            <TableCell>
              <EnrollmentApplicationStatusBadge status={application.status} />
            </TableCell>
            <TableCell>
              {application.status === ENROLLMENT_APPLICATION_STATUS.REJECTED && application.rejectionReason ? (
                <span className="text-destructive">{application.rejectionReason}</span>
              ) : (
                <span className="text-muted-foreground/60">—</span>
              )}
            </TableCell>
          </TableRow>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-44 p-1.5">
          <ContextMenuItem asChild>
            <ReturnToLink href={detailHref} className="px-2.5 py-1.5">
              {detailLabel}
            </ReturnToLink>
          </ContextMenuItem>
          {canCancel ? (
            <ContextMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => setIsCancelOpen(true)} disabled={isCancelOpen}>
              Cancelar
            </ContextMenuItem>
          ) : null}
        </ContextMenuContent>
      </ContextMenu>
      {isCancelOpen && (
        <EnrollmentCancelDialog
          applicationId={application.applicationId}
          onClose={() => setIsCancelOpen(false)}
          onCancelled={() => router.refresh()}
        />
      )}
    </>
  );
}
