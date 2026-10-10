"use client";

/* eslint-disable max-lines, no-restricted-syntax */

import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import { ClipboardPlusIcon, PhoneCallIcon, PlusIcon, SearchIcon, UserMinusIcon, UsersIcon, XIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { EmptyMedia } from "@common/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";

import { ENROLLMENT_PAGE_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";
import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import { AddGuardianDependentDialog } from "@features/guardian-dependents/components/add-guardian-dependent-dialog";
import { UnlinkGuardianDependentDialog } from "@features/guardian-dependents/components/unlink-guardian-dependent-dialog";
import { GUARDIAN_LINK_STATUS_LABELS, GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { GUARDIAN_LINK_STATUS, type GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import { getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { setGuardianWorkspaceAction } from "@features/guardian-workspace/actions/set-guardian-workspace.action";

type GuardianDependentsListProps = { dependents: GuardianDependent[]; institutionId: string; initialSearch?: string };

const ADD_LABEL = "Solicitar vinculación";

const STATUS_BADGE_VARIANT: Record<GuardianLinkStatus, "success" | "secondary" | "destructive" | "outline"> = {
  [GUARDIAN_LINK_STATUS.ACTIVE]: "success",
  [GUARDIAN_LINK_STATUS.PENDING]: "secondary",
  [GUARDIAN_LINK_STATUS.REJECTED]: "destructive",
  [GUARDIAN_LINK_STATUS.ENDED]: "outline",
};

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function matchesSearch(dependent: GuardianDependent, search: string): boolean {
  const term = normalize(search.trim());

  return normalize(getGuardianDependentName(dependent)).includes(term) || dependent.documentNumber.includes(term);
}

export function GuardianDependentsList({ dependents, institutionId, initialSearch = "" }: GuardianDependentsListProps): React.ReactElement {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [dependentToUnlink, setDependentToUnlink] = useState<GuardianDependent | null>(null);

  const [search, setSearch] = useState(initialSearch);

  const [isSelectingWorkspace, startSelectingWorkspace] = useTransition();

  const visibleDependents = dependents.filter((dependent) => matchesSearch(dependent, search));

  function handleEnrollment(dependentPersonId: string): void {
    startSelectingWorkspace(async () => {
      const result = await setGuardianWorkspaceAction(dependentPersonId);

      if ("success" in result) {
        router.push(ENROLLMENT_PAGE_PATH);
      }
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {dependents.length > 0 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={search} onChange={setSearch} />
            <AddButton onClick={() => setIsDialogOpen(true)} />
          </div>
          {visibleDependents.length > 0 ? (
            <div className="relative h-full overflow-hidden rounded-lg border">
              <Table containerClassName="table-scrollbar" className="min-w-220">
                <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
                  <TableRow className="hover:bg-muted/50 data-[state=selected]:bg-muted h-11 border-b transition-colors">
                    <TableHead>Persona</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>Edad</TableHead>
                    <TableHead>Tu vínculo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Inscripciones</TableHead>
                    <TableHead className="w-52 text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleDependents.map((dependent) => (
                    <DependentRow
                      dependent={dependent}
                      isSelectingWorkspace={isSelectingWorkspace}
                      key={dependent.personGuardianId}
                      onEnroll={() => handleEnrollment(dependent.dependentPersonId)}
                      onUnlink={() => setDependentToUnlink(dependent)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground bg-muted/25 rounded-lg border px-4 py-10 text-center text-sm">
              No encontramos personas a cargo que coincidan con tu búsqueda.
            </p>
          )}
        </>
      ) : (
        <div className="bg-muted/25 text-muted-foreground flex flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
          <EmptyMedia className="mb-4" variant="icon">
            <UsersIcon className="size-5" />
          </EmptyMedia>
          <h3 className="text-foreground text-base font-semibold">No hay personas a cargo</h3>
          <p className="text-muted-foreground mt-1.5 mb-6 max-w-sm text-sm">
            Todavía no tenés ninguna persona a cargo. Solicitá la vinculación con tu primera persona para comenzar sus inscripciones.
          </p>
          <AddButton onClick={() => setIsDialogOpen(true)} />
        </div>
      )}

      {isDialogOpen ? (
        <AddGuardianDependentDialog institutionId={institutionId} onClose={() => setIsDialogOpen(false)} onSuccess={() => setIsDialogOpen(false)} />
      ) : null}

      {dependentToUnlink ? (
        <UnlinkGuardianDependentDialog
          dependentName={getGuardianDependentName(dependentToUnlink)}
          dependentPersonId={dependentToUnlink.dependentPersonId}
          institutionId={institutionId}
          onClose={() => setDependentToUnlink(null)}
          onSuccess={() => setDependentToUnlink(null)}
        />
      ) : null}
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }): React.ReactElement {
  return (
    <InputGroup className="h-9 w-full sm:max-w-sm">
      <InputGroupAddon align="inline-start">
        <SearchIcon aria-hidden="true" className="text-muted-foreground size-4 shrink-0" />
      </InputGroupAddon>
      <InputGroupInput
        aria-label="Buscar por nombre o DNI"
        maxLength={100}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar por nombre o DNI"
        value={value}
      />
      {value.length > 0 ? (
        <InputGroupAddon align="inline-end">
          <InputGroupButton aria-label="Limpiar búsqueda" onClick={() => onChange("")} size="icon-sm" type="button">
            <XIcon aria-hidden="true" />
          </InputGroupButton>
        </InputGroupAddon>
      ) : null}
    </InputGroup>
  );
}

function AddButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <Button onClick={onClick} type="button">
      <PlusIcon aria-hidden="true" />
      {ADD_LABEL}
    </Button>
  );
}

function DependentRow({
  dependent,
  isSelectingWorkspace,
  onEnroll,
  onUnlink,
}: {
  dependent: GuardianDependent;
  isSelectingWorkspace: boolean;
  onEnroll: () => void;
  onUnlink: () => void;
}): React.ReactElement {
  const age = calculateAge(dependent.birthDate ?? undefined);

  const name = getGuardianDependentName(dependent);

  const isActive = dependent.status === GUARDIAN_LINK_STATUS.ACTIVE;

  const canUnlink = isActive || dependent.status === GUARDIAN_LINK_STATUS.PENDING;

  return (
    <TableRow className="h-12">
      <TableCell className="font-medium">
        <div className="flex min-w-44 flex-col gap-1">
          <span>{name}</span>
          {dependent.isPrimaryContact ? (
            <span className="text-primary flex items-center gap-1.5 text-xs font-medium">
              <PhoneCallIcon aria-hidden="true" className="size-3.5" />
              Sos su contacto principal
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell>{dependent.documentNumber}</TableCell>
      <TableCell>{age === null || age === undefined ? "—" : `${age} años`}</TableCell>
      <TableCell>{GUARDIAN_RELATIONSHIP_LABELS[dependent.relationship]}</TableCell>
      <TableCell>
        <div className="flex max-w-64 flex-col items-start gap-1.5">
          <Badge variant={STATUS_BADGE_VARIANT[dependent.status]}>{GUARDIAN_LINK_STATUS_LABELS[dependent.status]}</Badge>
          {!isActive ? (
            <span className="text-muted-foreground text-xs whitespace-normal">
              {dependent.status === GUARDIAN_LINK_STATUS.PENDING
                ? "La institución todavía tiene que validar la vinculación. Hasta entonces no podés gestionar a esta persona."
                : "La institución rechazó la vinculación. No podés gestionar a esta persona."}
            </span>
          ) : null}
        </div>
      </TableCell>
      <TableCell>
        {isActive ? (
          <span className={dependent.activeApplicationsCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
            {dependent.activeApplicationsCount} {dependent.activeApplicationsCount === 1 ? "inscripción activa" : "inscripciones activas"}
          </span>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell className="w-52 text-right">
        {canUnlink ? (
          <div className="flex justify-end gap-2">
            {isActive ? (
              <Button aria-label={`Inscribir a ${name}`} disabled={isSelectingWorkspace} onClick={onEnroll} size="sm" type="button">
                <ClipboardPlusIcon aria-hidden="true" />
                Inscribir
              </Button>
            ) : null}
            <Button aria-label={`Quitar a ${name}`} onClick={onUnlink} size="sm" type="button" variant="outline">
              <UserMinusIcon aria-hidden="true" />
              {dependent.status === GUARDIAN_LINK_STATUS.PENDING ? "Cancelar solicitud" : "Quitar"}
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </TableCell>
    </TableRow>
  );
}
