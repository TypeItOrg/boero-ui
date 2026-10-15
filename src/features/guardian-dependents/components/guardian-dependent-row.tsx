import type { ReactElement } from "react";

import { CircleQuestionMarkIcon, EllipsisVerticalIcon } from "lucide-react";

import { OptionalValue } from "@common/components/optional-value";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@common/components/ui/context-menu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from "@common/components/ui/popover";
import { TableCell, TableRow } from "@common/components/ui/table";

import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import { GUARDIAN_LINK_STATUS_LABELS, GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { GUARDIAN_LINK_STATUS, type GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import { getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";

const STATUS_BADGE_VARIANT: Record<GuardianLinkStatus, "success" | "secondary" | "destructive" | "outline"> = {
  ACTIVE: "success",
  PENDING: "secondary",
  REJECTED: "destructive",
  ENDED: "outline",
};

const STATUS_DETAILS: Record<GuardianLinkStatus, string> = {
  ACTIVE: "La institución aprobó la vinculación. Ya podés gestionar las inscripciones de esta persona.",
  PENDING: "La institución todavía tiene que validar la vinculación. Hasta entonces no podés gestionar a esta persona.",
  REJECTED: "La institución rechazó la vinculación. Contactá a la institución si necesitás revisar la solicitud.",
  ENDED: "La vinculación finalizó. Ya no podés gestionar a esta persona.",
};

export function GuardianDependentRow({
  dependent,
  isSelectingWorkspace,
  onEnroll,
  onUnlink,
}: {
  dependent: GuardianDependent;
  isSelectingWorkspace: boolean;
  onEnroll: () => void;
  onUnlink: () => void;
}): ReactElement {
  const name = getGuardianDependentName(dependent) || "esta persona";

  const age = calculateAge(dependent.birthDate ?? undefined);

  const isActive = dependent.status === GUARDIAN_LINK_STATUS.ACTIVE;

  const canUnlink = isActive || dependent.status === GUARDIAN_LINK_STATUS.PENDING;

  const tableRow = (
    <TableRow className="h-12">
      <TableCell className="w-16 pl-4">
        {canUnlink ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label={`Abrir acciones de ${name}`} size="icon" type="button" variant="ghost">
                <EllipsisVerticalIcon aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48 p-1.5">
              {isActive ? (
                <>
                  <DropdownMenuItem className="px-2.5 py-1.5" disabled={isSelectingWorkspace} onSelect={onEnroll}>
                    Inscribir
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              ) : null}
              <DropdownMenuItem className="px-2.5 py-1.5" onSelect={onUnlink} variant="destructive">
                {isActive ? "Quitar vinculación" : "Cancelar solicitud"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <span className="sr-only">Sin acciones disponibles</span>
        )}
      </TableCell>
      <TableCell className="font-medium">
        <OptionalValue value={dependent.firstName} fallback="Nombre no informado" />
      </TableCell>
      <TableCell className="font-medium">
        <OptionalValue value={dependent.lastName} fallback="Apellido no informado" />
      </TableCell>
      <TableCell className="tabular-nums">{dependent.documentNumber}</TableCell>
      <TableCell className="tabular-nums">
        <OptionalValue value={age === null ? null : `${age} ${age === 1 ? "año" : "años"}`} fallback="Edad no informada" />
      </TableCell>
      <TableCell>{GUARDIAN_RELATIONSHIP_LABELS[dependent.relationship]}</TableCell>
      <TableCell>{dependent.isPrimaryContact ? "Sí" : "No"}</TableCell>
      <TableCell>
        <Popover>
          <PopoverTrigger asChild>
            <Badge asChild size="lg" className="[&>svg]:size-3.5!" variant={STATUS_BADGE_VARIANT[dependent.status]}>
              <button
                aria-label={`Ver detalle del estado: ${GUARDIAN_LINK_STATUS_LABELS[dependent.status]} de ${name}`}
                className="cursor-pointer gap-1.5"
                type="button"
              >
                {GUARDIAN_LINK_STATUS_LABELS[dependent.status]}
                <CircleQuestionMarkIcon aria-hidden="true" className="size-3.5" />
              </button>
            </Badge>
          </PopoverTrigger>
          <PopoverContent align="start" className="max-w-[calc(100vw-2rem)] p-3">
            <PopoverHeader>
              <PopoverTitle>{GUARDIAN_LINK_STATUS_LABELS[dependent.status]}</PopoverTitle>
              <PopoverDescription>{STATUS_DETAILS[dependent.status]}</PopoverDescription>
            </PopoverHeader>
          </PopoverContent>
        </Popover>
      </TableCell>
      <TableCell className="tabular-nums">
        <OptionalValue
          value={
            isActive && dependent.activeApplicationsCount > 0
              ? `${dependent.activeApplicationsCount} ${dependent.activeApplicationsCount === 1 ? "inscripción activa" : "inscripciones activas"}`
              : null
          }
          fallback="Sin inscripciones"
        />
      </TableCell>
    </TableRow>
  );

  if (!canUnlink) {
    return tableRow;
  }

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{tableRow}</ContextMenuTrigger>
      <ContextMenuContent className="w-48 p-1.5">
        {isActive ? (
          <>
            <ContextMenuItem className="px-2.5 py-1.5" disabled={isSelectingWorkspace} onSelect={onEnroll}>
              Inscribir
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        ) : null}
        <ContextMenuItem className="px-2.5 py-1.5" onSelect={onUnlink} variant="destructive">
          {isActive ? "Quitar vinculación" : "Cancelar solicitud"}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
