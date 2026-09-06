"use client";

import { BadgeCheckIcon, BanIcon, EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
import { formatEnrollmentApplicationDate } from "../utils/enrollment-application-date.util";
import { EnrollmentApplicationStatusBadge } from "./enrollment-application-status-badge";

type EnrollmentApplicationTableRowProps = {
  application: EnrollmentApplication;
  canApprove: boolean;
  canReject: boolean;
  onApprove: (application: EnrollmentApplication) => void;
  onReject: (application: EnrollmentApplication) => void;
};

export function EnrollmentApplicationTableRow({
  application,
  canApprove,
  canReject,
  onApprove,
  onReject,
}: EnrollmentApplicationTableRowProps): React.ReactElement {
  const isPendingEvaluation = application.status === "SUBMITTED";
  const canResolve = isPendingEvaluation && (canApprove || canReject);

  return (
    <TableRow className="hover:bg-muted/50 h-11 border-b transition-colors">
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
      <TableCell>
        {canResolve ? (
          <div className="flex justify-end">
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
              <DropdownMenuContent align="end" className="w-48 p-1.5">
                {canApprove ? (
                  <DropdownMenuItem className="px-2.5 py-1.5" onSelect={() => onApprove(application)}>
                    <BadgeCheckIcon data-icon="inline-start" />
                    Aprobar inscripción
                  </DropdownMenuItem>
                ) : null}
                {canReject ? (
                  <>
                    {canApprove ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuItem variant="destructive" className="px-2.5 py-1.5" onSelect={() => onReject(application)}>
                      <BanIcon data-icon="inline-start" />
                      Rechazar inscripción
                    </DropdownMenuItem>
                  </>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : null}
      </TableCell>
    </TableRow>
  );
}
