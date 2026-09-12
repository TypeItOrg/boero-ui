"use client";

import Link from "next/link";
import { TableCell, TableRow } from "@common/components/ui/table";
import { Button } from "@common/components/ui/button";
import type { EnrollmentApplication } from "../types/enrollment-application.types";
import { formatEnrollmentApplicationDate } from "../utils/enrollment-application-date.util";
import { EnrollmentApplicationStatusBadge } from "./enrollment-application-status-badge";
import { EnrollmentApplicationCancelButton } from "./enrollment-application-cancel-button";

type MyEnrollmentApplicationTableRowProps = {
  application: EnrollmentApplication;
};

export function MyEnrollmentApplicationTableRow({ application }: MyEnrollmentApplicationTableRowProps): React.ReactElement {
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
      <TableCell className="flex gap-1">
        {application.status === "DRAFT" && (
          <Link href={`/enrollment/${application.applicationId}`}>
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              Ver
            </Button>
          </Link>
        )}
        {(application.status === "DRAFT" || application.status === "SUBMITTED") && (
          <EnrollmentApplicationCancelButton applicationId={application.applicationId} />
        )}
      </TableCell>
    </TableRow>
  );
}
