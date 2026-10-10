"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@common/components/ui/context-menu";

import { ENROLLMENT_PERIOD_STATUS, type EnrollmentPeriodStatus } from "@features/enrollment-periods/types/enrollment-period-status.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";

export function EnrollmentPeriodContextActions({
  canUpdate,
  period,
  isChangingStatus,
  editHref,
  canChangeStatus,
  handleStatusChange,
  hasSensitiveActions,
  hasRegularActions,
  canClosePeriod,
  canDeletePeriod,
  setDeletingPeriodId,
}: {
  canUpdate: boolean;
  period: EnrollmentPeriod;
  isChangingStatus: boolean;
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
    <ContextMenuContent className="w-44 p-1.5">
      {canUpdate && period.canUpdate ? (
        <ContextMenuItem asChild disabled={isChangingStatus}>
          <ReturnToLink href={editHref} className="px-2.5 py-1.5">
            Editar
          </ReturnToLink>
        </ContextMenuItem>
      ) : null}
      {canChangeStatus && period.canChangeStatus && period.status !== ENROLLMENT_PERIOD_STATUS.OPEN ? (
        <ContextMenuItem
          className="px-2.5 py-1.5"
          disabled={isChangingStatus}
          onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.OPEN)}
        >
          Abrir inscripciones
        </ContextMenuItem>
      ) : null}
      {hasSensitiveActions && hasRegularActions ? <ContextMenuSeparator /> : null}
      {canClosePeriod ? (
        <ContextMenuItem
          variant="destructive"
          className="px-2.5 py-1.5"
          disabled={isChangingStatus}
          onSelect={() => handleStatusChange(period.id, ENROLLMENT_PERIOD_STATUS.CLOSED)}
        >
          Cerrar inscripciones
        </ContextMenuItem>
      ) : null}
      {canDeletePeriod ? (
        <ContextMenuItem
          className="text-destructive focus:text-destructive px-2.5 py-1.5"
          disabled={isChangingStatus}
          onSelect={() => setDeletingPeriodId(period.id)}
        >
          Eliminar
        </ContextMenuItem>
      ) : null}
    </ContextMenuContent>
  );
}
