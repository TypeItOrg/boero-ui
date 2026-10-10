"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { EllipsisVerticalIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import { ENROLLMENT_PERIOD_STATUS, type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export function EnrollmentPeriodDropdownActions({
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
}): ReactElement {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={`Abrir acciones de ${period.name}`} disabled={isChangingStatus}>
          <EllipsisVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44 p-1.5">
        {canUpdate && period.canUpdate ? (
          <DropdownMenuItem asChild>
            <ReturnToLink href={editHref} className="px-2.5 py-1.5">
              Editar
            </ReturnToLink>
          </DropdownMenuItem>
        ) : null}
        {canChangeStatus && period.canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.OPEN ? (
          <DropdownMenuItem className="px-2.5 py-1.5" onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.OPEN)}>
            Abrir inscripciones
          </DropdownMenuItem>
        ) : null}
        {hasSensitiveActions && hasRegularActions ? <DropdownMenuSeparator /> : null}
        {canClosePeriod ? (
          <DropdownMenuItem
            variant="destructive"
            className="px-2.5 py-1.5"
            onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.CLOSED)}
          >
            Cerrar inscripciones
          </DropdownMenuItem>
        ) : null}
        {canDeletePeriod ? (
          <DropdownMenuItem className="text-destructive focus:text-destructive px-2.5 py-1.5" onSelect={() => setDeletingPeriodId(period.id)}>
            Eliminar
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
