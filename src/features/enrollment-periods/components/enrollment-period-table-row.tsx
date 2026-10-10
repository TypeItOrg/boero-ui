"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { Badge } from "@common/components/ui/badge";
import { ContextMenu, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { TableCell, TableRow } from "@common/components/ui/table";

import { EnrollmentPeriodContextActions } from "@features/enrollment-periods/components/enrollment-period-context-actions";
import { EnrollmentPeriodDropdownActions } from "@features/enrollment-periods/components/enrollment-period-dropdown-actions";
import { EnrollmentPeriodNameCell } from "@features/enrollment-periods/components/enrollment-period-name-cell";
import { type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { formatEnrollmentPeriodDateTime } from "@features/enrollment-periods/utils/enrollment-period-date.util";

export function EnrollmentPeriodTableRow({
  period,
  isChangingStatus,
  canUpdate,
  editHref,
  canChangeStatus,
  handleStatusChange,
  hasSensitiveActions,
  hasRegularActions,
  canClosePeriod,
  canDeletePeriod,
  setDeletingPeriodId,
  statusInfo,
}: {
  period: EnrollmentPeriod;
  isChangingStatus: boolean;
  canUpdate: boolean;
  editHref: string;
  canChangeStatus: boolean;
  handleStatusChange: (periodId: string, status: EnrollmentPeriodStatus) => void;
  hasSensitiveActions: boolean;
  hasRegularActions: boolean;
  canClosePeriod: boolean;
  canDeletePeriod: boolean;
  setDeletingPeriodId: Dispatch<SetStateAction<string | null>>;
  statusInfo: { label: string; variant: "outline" | "default" | "secondary" | "destructive" };
}): ReactElement {
  return (
    <ContextMenu key={period.id}>
      <ContextMenuTrigger asChild>
        <TableRow>
          <TableCell className="w-16 pl-4">
            <div className="flex justify-start">
              <EnrollmentPeriodDropdownActions
                period={period}
                isChangingStatus={isChangingStatus}
                canUpdate={canUpdate}
                editHref={editHref}
                canChangeStatus={canChangeStatus}
                handleStatusChange={handleStatusChange}
                hasSensitiveActions={hasSensitiveActions}
                hasRegularActions={hasRegularActions}
                canClosePeriod={canClosePeriod}
                canDeletePeriod={canDeletePeriod}
                setDeletingPeriodId={setDeletingPeriodId}
              />
            </div>
          </TableCell>
          <TableCell className="font-medium">
            <EnrollmentPeriodNameCell period={period} />
          </TableCell>
          <TableCell>Ciclo {period.academicYearNumber}</TableCell>
          <TableCell>{formatEnrollmentPeriodDateTime(period.startDate)}</TableCell>
          <TableCell>{formatEnrollmentPeriodDateTime(period.endDate)}</TableCell>
          <TableCell>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </TableCell>
        </TableRow>
      </ContextMenuTrigger>
      <EnrollmentPeriodContextActions
        canUpdate={canUpdate}
        period={period}
        isChangingStatus={isChangingStatus}
        editHref={editHref}
        canChangeStatus={canChangeStatus}
        handleStatusChange={handleStatusChange}
        hasSensitiveActions={hasSensitiveActions}
        hasRegularActions={hasRegularActions}
        canClosePeriod={canClosePeriod}
        canDeletePeriod={canDeletePeriod}
        setDeletingPeriodId={setDeletingPeriodId}
      />
    </ContextMenu>
  );
}
