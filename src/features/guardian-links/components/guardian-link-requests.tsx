"use client";

import { useState, useTransition } from "react";
import { CheckIcon, FileTextIcon, UsersIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { EmptyMedia } from "@common/components/ui/empty";
import { GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import { formatApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application.util";
import { resolveGuardianLinkAction } from "@features/guardian-links/actions/resolve-guardian-link.action";
import { getGuardianLinkAttachmentContentPath } from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkDecision, GuardianLinkPerson, GuardianLinkRequest } from "@features/guardian-links/types/guardian-link-request.types";

type GuardianLinkRequestsProps = { requests: GuardianLinkRequest[]; institutionId: string };

export function GuardianLinkRequests({ requests, institutionId }: GuardianLinkRequestsProps): React.ReactElement {
  if (requests.length === 0) {
    return (
      <div className="bg-muted/25 text-muted-foreground flex flex-col items-center justify-center rounded-lg border px-4 py-12 text-center">
        <EmptyMedia className="mb-4" variant="icon">
          <UsersIcon className="size-5" />
        </EmptyMedia>
        <h3 className="text-foreground text-base font-semibold">No hay solicitudes pendientes</h3>
        <p className="mt-1.5 max-w-sm text-sm">Cuando un tutor solicite vincularse con una persona, la solicitud aparece acá para validarla.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-4 lg:grid-cols-2">
      {requests.map((request) => (
        <li key={request.personGuardianId}>
          <RequestCard institutionId={institutionId} request={request} />
        </li>
      ))}
    </ul>
  );
}

function RequestCard({ request, institutionId }: { request: GuardianLinkRequest; institutionId: string }): React.ReactElement {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function resolve(decision: GuardianLinkDecision): void {
    setError(null);
    startTransition(async () => {
      try {
        const result = await resolveGuardianLinkAction(institutionId, request.personGuardianId, decision);

        if (result.error) {
          setError(result.error);
        }
      } catch {
        setError("No se pudo resolver la solicitud.");
      }
    });
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Solicitud del {formatApplicationDateTime(request.createdAt)}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
          <PersonField label="Tutor" person={request.tutor} />
          <PersonField label="Estudiante" person={request.dependent} />
          <PersonField label="Fecha de nacimiento" value={request.dependent.birthDate ? formatDisplayDate(request.dependent.birthDate) : "—"} />
          <PersonField label="Edad" value={formatAge(request.dependent.birthDate)} />
          <div className="flex flex-col gap-0.5">
            <dt className="text-muted-foreground text-xs">Vínculo declarado</dt>
            <dd className="text-foreground text-sm font-medium">{GUARDIAN_RELATIONSHIP_LABELS[request.relationship]}</dd>
          </div>
        </dl>
        <div className="flex flex-col gap-1.5">
          <p className="text-muted-foreground text-xs">Documentación respaldatoria</p>
          {request.attachments.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {request.attachments.map((attachment) => (
                <li key={attachment.id}>
                  <a
                    className="text-primary inline-flex items-center gap-1.5 hover:underline"
                    href={getGuardianLinkAttachmentContentPath(request.personGuardianId, attachment.id)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <FileTextIcon aria-hidden="true" className="size-4" />
                    {attachment.originalFileName}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Sin documentación adjunta</p>
          )}
        </div>
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
      <CardFooter className="justify-end gap-2">
        <Button disabled={isPending} onClick={() => resolve("reject")} size="sm" type="button" variant="outline">
          <XIcon aria-hidden="true" />
          Rechazar
        </Button>
        <Button disabled={isPending} onClick={() => resolve("approve")} size="sm" type="button">
          <CheckIcon aria-hidden="true" />
          Aprobar
        </Button>
      </CardFooter>
    </Card>
  );
}

function PersonField({ label, person }: { label: string; person: GuardianLinkPerson }): React.ReactElement;
function PersonField({ label, value }: { label: string; value: string }): React.ReactElement;
function PersonField({ label, person, value }: { label: string; person?: GuardianLinkPerson; value?: string }): React.ReactElement {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-muted-foreground text-xs">{label}</dt>
      {person ? (
        <>
          <dd className="text-foreground text-sm font-medium">{getGuardianDependentName(person)}</dd>
          <dd className="text-muted-foreground text-xs">DNI {person.documentNumber}</dd>
        </>
      ) : (
        <dd className="text-foreground text-sm font-medium">{value}</dd>
      )}
    </div>
  );
}

function formatAge(birthDate: string | null): string {
  const age = calculateAge(birthDate ?? undefined);

  return age === null ? "—" : `${age} años`;
}
