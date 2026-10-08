"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { Table, TableBody, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodTableRow } from "@features/enrollment-periods/components/enrollment-period-table-row";
import { statusBadges } from "@features/enrollment-periods/constants/enrollment-period-status-badges.constants";
import { ENROLLMENT_PERIOD_STATUS, type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export function EnrollmentPeriodResultsTable({
  data,
  scope,
  institutionId,
  canChangeStatus,
  canDelete,
  canUpdate,
  isChangingStatus,
  handleStatusChange,
  setDeletingPeriodId,
}: {
  data: PaginatedResponse<EnrollmentPeriod>;
  scope: AcademicScope;
  institutionId: string;
  canChangeStatus: boolean;
  canDelete: boolean;
  canUpdate: boolean;
  isChangingStatus: boolean;
  handleStatusChange: (periodId: string, status: EnrollmentPeriodStatus) => void;
  setDeletingPeriodId: Dispatch<SetStateAction<string | null>>;
}): ReactElement {
  return (
    <Table containerClassName="table-scrollbar h-full" className="min-w-225">
      <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
        <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
          <TableHead className="w-16 pl-4">
            <span className="sr-only">Acciones</span>
          </TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead>Ciclo lectivo</TableHead>
          <TableHead>Fecha de inicio</TableHead>
          <TableHead>Fecha de fin</TableHead>
          <TableHead>Estado</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.items.map((period) => {
          const statusInfo = statusBadges[period.status];
          const editHref = AcademicScope.isAdmin(scope)
            ? `/admin/enrollment-periods/${period.id}/edit?institutionId=${encodeURIComponent(institutionId)}`
            : `/enrollment-periods/${period.id}/edit`;
          const canClosePeriod = canChangeStatus && period.canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.CLOSED;
          const canDeletePeriod = canDelete && period.canDelete;
          const hasSensitiveActions = canClosePeriod || canDeletePeriod;
          const hasRegularActions =
            (canUpdate && period.canUpdate) || (canChangeStatus && period.canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.OPEN);

          return (
            <EnrollmentPeriodTableRow
              key={period.id}
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
              statusInfo={statusInfo}
            />
          );
        })}
      </TableBody>
    </Table>
  );
}
