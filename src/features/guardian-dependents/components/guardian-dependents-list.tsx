"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ClipboardPlusIcon, PhoneCallIcon, PlusIcon, SearchIcon, UserMinusIcon, UsersIcon, XIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { EmptyMedia } from "@common/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@common/components/ui/input-group";
import { AddGuardianDependentDialog } from "@features/guardian-dependents/components/add-guardian-dependent-dialog";
import { UnlinkGuardianDependentDialog } from "@features/guardian-dependents/components/unlink-guardian-dependent-dialog";
import { setGuardianWorkspaceAction } from "@features/guardian-workspace/actions/set-guardian-workspace.action";
import { ENROLLMENT_PAGE_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";
import { GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";

type GuardianDependentsListProps = { dependents: GuardianDependent[]; institutionId: string; initialSearch?: string };

const ADD_LABEL = "Agregar persona a cargo";

function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function matchesSearch(dependent: GuardianDependent, search: string): boolean {
  const term = normalize(search.trim());

  return normalize(`${dependent.firstName} ${dependent.lastName}`).includes(term) || dependent.documentNumber.includes(term);
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
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibleDependents.map((dependent) => (
                <li key={dependent.personGuardianId}>
                  <DependentCard
                    dependent={dependent}
                    isSelectingWorkspace={isSelectingWorkspace}
                    onEnroll={() => handleEnrollment(dependent.dependentPersonId)}
                    onUnlink={() => setDependentToUnlink(dependent)}
                  />
                </li>
              ))}
            </ul>
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
            Todavía no tenés ningún estudiante a cargo registrado. Agregá a tu primer hijo para comenzar sus inscripciones.
          </p>
          <AddButton onClick={() => setIsDialogOpen(true)} />
        </div>
      )}

      {isDialogOpen ? (
        <AddGuardianDependentDialog institutionId={institutionId} onClose={() => setIsDialogOpen(false)} onSuccess={() => setIsDialogOpen(false)} />
      ) : null}

      {dependentToUnlink ? (
        <UnlinkGuardianDependentDialog
          dependentName={`${dependentToUnlink.firstName} ${dependentToUnlink.lastName}`}
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

function DependentField({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="text-foreground text-sm font-medium">{value}</dd>
    </div>
  );
}

function DependentCard({
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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {dependent.firstName} {dependent.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <DependentField label="DNI" value={dependent.documentNumber} />
          <DependentField label="Edad" value={age === null || age === undefined ? "—" : `${age} años`} />
          <DependentField label="Tu vínculo" value={GUARDIAN_RELATIONSHIP_LABELS[dependent.relationship]} />
        </dl>
        {dependent.isPrimaryContact ? (
          <p className="text-primary flex items-center gap-1.5 text-xs font-medium">
            <PhoneCallIcon aria-hidden="true" className="size-3.5" />
            Sos su contacto principal
          </p>
        ) : null}
        <p className={dependent.activeApplicationsCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}>
          {dependent.activeApplicationsCount} {dependent.activeApplicationsCount === 1 ? "inscripción activa" : "inscripciones activas"}
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button
          aria-label={`Inscribir a ${dependent.firstName} ${dependent.lastName}`}
          disabled={isSelectingWorkspace}
          onClick={onEnroll}
          size="sm"
          type="button"
        >
          <ClipboardPlusIcon aria-hidden="true" />
          Inscribir
        </Button>
        <Button aria-label={`Quitar a ${dependent.firstName} ${dependent.lastName}`} onClick={onUnlink} size="sm" type="button" variant="outline">
          <UserMinusIcon aria-hidden="true" />
          Quitar
        </Button>
      </CardFooter>
    </Card>
  );
}
