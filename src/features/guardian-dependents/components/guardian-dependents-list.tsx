"use client";

import { useState } from "react";
import Link from "next/link";
import { ClipboardPlusIcon, PlusIcon, UserMinusIcon, UsersIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { EmptyMedia } from "@common/components/ui/empty";
import { AddGuardianDependentDialog } from "@features/guardian-dependents/components/add-guardian-dependent-dialog";
import { UnlinkGuardianDependentDialog } from "@features/guardian-dependents/components/unlink-guardian-dependent-dialog";
import { ENROLLMENT_PAGE_PATH } from "@features/enrollment-applications/constants/enrollment-application.constants";
import { GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import type { GuardianDependent } from "@features/guardian-dependents/types/guardian-dependent.types";
import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";

type GuardianDependentsListProps = { dependents: GuardianDependent[]; institutionId: string };

const ADD_LABEL = "Agregar persona a cargo";

export function GuardianDependentsList({ dependents, institutionId }: GuardianDependentsListProps): React.ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dependentToUnlink, setDependentToUnlink] = useState<GuardianDependent | null>(null);

  return (
    <div className="flex flex-col gap-6">
      {dependents.length > 0 ? (
        <>
          <div className="flex justify-end">
            <AddButton onClick={() => setIsDialogOpen(true)} />
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {dependents.map((dependent) => (
              <li key={dependent.personGuardianId}>
                <DependentCard dependent={dependent} onUnlink={() => setDependentToUnlink(dependent)} />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className="bg-muted/25 text-muted-foreground flex flex-col items-center justify-center gap-4 rounded-lg border px-4 py-12 text-center">
          <EmptyMedia variant="icon">
            <UsersIcon className="size-5" />
          </EmptyMedia>
          <p className="text-foreground max-w-md text-sm">
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

function AddButton({ onClick }: { onClick: () => void }): React.ReactElement {
  return (
    <Button onClick={onClick} type="button">
      <PlusIcon aria-hidden="true" />
      {ADD_LABEL}
    </Button>
  );
}

function DependentCard({ dependent, onUnlink }: { dependent: GuardianDependent; onUnlink: () => void }): React.ReactElement {
  const age = calculateAge(dependent.birthDate ?? undefined);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>
          {dependent.firstName} {dependent.lastName}
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground flex flex-col gap-2 text-sm">
        <p>DNI: {dependent.documentNumber}</p>
        <p>Edad: {age ?? "—"}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{GUARDIAN_RELATIONSHIP_LABELS[dependent.relationship]}</Badge>
          {dependent.isPrimaryContact ? <Badge variant="outline">Contacto principal</Badge> : null}
        </div>
        <p>
          {dependent.activeApplicationsCount} {dependent.activeApplicationsCount === 1 ? "inscripción activa" : "inscripciones activas"}
        </p>
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button asChild size="sm">
          <Link
            aria-label={`Inscribir a ${dependent.firstName} ${dependent.lastName}`}
            href={`${ENROLLMENT_PAGE_PATH}?dependentId=${dependent.dependentPersonId}`}
          >
            <ClipboardPlusIcon aria-hidden="true" />
            Inscribir
          </Link>
        </Button>
        <Button aria-label={`Quitar a ${dependent.firstName} ${dependent.lastName}`} onClick={onUnlink} size="sm" type="button" variant="outline">
          <UserMinusIcon aria-hidden="true" />
          Quitar
        </Button>
      </CardFooter>
    </Card>
  );
}
