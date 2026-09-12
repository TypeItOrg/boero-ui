"use client";

import Link from "next/link";
import * as React from "react";
import { EllipsisVerticalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@common/components/ui/dropdown-menu";
import { TableCell, TableRow } from "@common/components/ui/table";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
import { formatEnrollmentApplicationDate } from "../utils/enrollment-application-date.util";
import { EnrollmentApplicationStatusBadge } from "./enrollment-application-status-badge";
import { cancelEnrollmentApplicationAction } from "../actions/enrollment-application.actions";

type MyEnrollmentApplicationTableRowProps = {
  application: EnrollmentApplication;
};

export function MyEnrollmentApplicationTableRow({ application }: MyEnrollmentApplicationTableRowProps): React.ReactElement {
  const [isPending, setIsPending] = React.useState(false);

  const handleCancel = async () => {
    if (!confirm("¿Estás seguro de que querés cancelar esta inscripción?")) return;
    setIsPending(true);
    try {
      await cancelEnrollmentApplicationAction(application.applicationId);
      window.location.reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al cancelar";
      alert(msg);
      setIsPending(false);
    }
  };

  const canViewDraft = application.status === "DRAFT";
  const canCancel = application.status === "DRAFT" || application.status === "SUBMITTED";

  return (
    <TableRow className="hover:bg-muted/50 h-11 border-b transition-colors">
      <TableCell className="font-medium">{application.studyPlanName}</TableCell>
      <TableCell>{application.academicYear}</TableCell>
      <TableCell className="text-muted-foreground">{formatEnrollmentApplicationDate(application.createdAt)}</TableCell>
      <TableCell>
        <EnrollmentApplicationStatusBadge status={application.status} />
      </TableCell>
      <TableCell>
        {application.status === "REJECTED" && application.rejectionReason ? (
          <span className="text-destructive">{application.rejectionReason}</span>
        ) : (
          <span className="text-muted-foreground/60">—</span>
        )}
      </TableCell>
      <TableCell>
        {(canViewDraft || canCancel) && (
          <div className="flex justify-end">
            <DropdownMenu>
              <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                <button aria-label="Abrir acciones" disabled={isPending}>
                  <EllipsisVerticalIcon className="size-4" />
                </button>
              </Button>
              <DropdownMenuContent align="end" className="w-44 p-1.5">
                {canViewDraft && (
                  <DropdownMenuItem asChild>
                    <Link href={`/enrollment/${application.applicationId}`} className="cursor-pointer px-2.5 py-1.5">
                      Ver
                    </Link>
                  </DropdownMenuItem>
                )}
                {canCancel && (
                  <>
                    {canViewDraft && <DropdownMenuSeparator />}
                    <DropdownMenuItem variant="destructive" onClick={handleCancel} disabled={isPending} className="px-2.5 py-1.5">
                      {isPending ? "Cancelando…" : "Cancelar"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </TableCell>
    </TableRow>
  );
}
