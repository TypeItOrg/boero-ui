"use client";

/* eslint-disable max-lines, no-nested-ternary, no-restricted-syntax */

import { useMemo, useState, useTransition } from "react";

import { CheckIcon, FileTextIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Input } from "@common/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@common/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@common/components/ui/table";
import { formatDisplayDate } from "@common/utils/date-input.util";

import { calculateAge } from "@features/enrollment-applications/schemas/enrollment-application.schema";
import { formatApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application.util";
import { GUARDIAN_RELATIONSHIP_LABELS } from "@features/guardian-dependents/constants/guardian-dependent.constants";
import { GUARDIAN_LINK_STATUS, type GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import { getGuardianDependentName } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { resolveGuardianLinkAction } from "@features/guardian-links/actions/resolve-guardian-link.action";
import {
  getGuardianLinkAttachmentContentPath,
  getPlatformGuardianLinkAttachmentContentPath,
} from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkDecision, GuardianLinkPerson, GuardianLinkRequest } from "@features/guardian-links/types/guardian-link-request.types";

type GuardianLinkRequestsProps = {
  requests: GuardianLinkRequest[];
  institutionId?: string;
  onResolve?: (institutionId: string, linkId: string, decision: GuardianLinkDecision) => Promise<{ error?: string }>;
  attachmentPathMode?: "institutional" | "platform";
  showInstitution?: boolean;
};
type StatusFilter = "ALL" | GuardianLinkStatus;

const STATUS_LABELS: Record<StatusFilter, string> = {
  ALL: "Todos los estados",
  PENDING: "Pendientes",
  ACTIVE: "Aceptadas",
  REJECTED: "Rechazadas",
  ENDED: "Finalizadas",
};

export function GuardianLinkRequests({
  requests,
  institutionId,
  onResolve = resolveGuardianLinkAction,
  attachmentPathMode = "institutional",
  showInstitution = false,
}: GuardianLinkRequestsProps): React.ReactElement {
  const [rows, setRows] = useState(requests);

  const [search, setSearch] = useState("");

  const [documentNumber, setDocumentNumber] = useState("");

  const [status, setStatus] = useState<StatusFilter>("ALL");

  const normalizedSearch = search.trim().toLocaleLowerCase();

  const filteredRows = useMemo(
    () =>
      rows.filter((request) => {
        const people = `${getGuardianDependentName(request.tutor)} ${getGuardianDependentName(request.dependent)}`.toLocaleLowerCase();

        const documents = `${request.tutor.documentNumber} ${request.dependent.documentNumber}`;

        return (
          (status === "ALL" || request.status === status) &&
          (!normalizedSearch || people.includes(normalizedSearch)) &&
          (!documentNumber.trim() || documents.includes(documentNumber.trim()))
        );
      }),
    [documentNumber, normalizedSearch, rows, status],
  );

  function updateRow(requestId: string, nextStatus: GuardianLinkStatus): void {
    setRows((currentRows) => currentRows.map((row) => (row.personGuardianId === requestId ? { ...row, status: nextStatus } : row)));
  }

  return (
    <div className="flex flex-col gap-4">
      <GuardianLinkFilters
        documentNumber={documentNumber}
        onDocumentNumberChange={setDocumentNumber}
        onSearchChange={setSearch}
        onStatusChange={(value) => setStatus(value as StatusFilter)}
        search={search}
        status={status}
      />

      {filteredRows.length === 0 ? (
        <EmptyRequests hasFilters={rows.length > 0} />
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table containerClassName="table-scrollbar" className="min-w-240">
            <TableHeader className="bg-muted sticky top-0 z-10 [&_tr]:border-b">
              <TableRow>
                {showInstitution ? <TableHead>Institución</TableHead> : null}
                <TableHead>Tutor</TableHead>
                <TableHead>Estudiante</TableHead>
                <TableHead>Vínculo</TableHead>
                <TableHead>Solicitud</TableHead>
                <TableHead>Documentación</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-52 text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.map((request) => (
                <RequestRow
                  attachmentPathMode={attachmentPathMode}
                  institutionId={institutionId}
                  key={request.personGuardianId}
                  onResolve={onResolve}
                  onResolved={updateRow}
                  request={request}
                  showInstitution={showInstitution}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function GuardianLinkFilters({
  search,
  documentNumber,
  status,
  onSearchChange,
  onDocumentNumberChange,
  onStatusChange,
}: {
  search: string;
  documentNumber: string;
  status: StatusFilter;
  onSearchChange: (value: string) => void;
  onDocumentNumberChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}): React.ReactElement {
  return (
    <div className="bg-muted/25 flex flex-row flex-wrap gap-3 rounded-lg border p-4 md:items-end">
      <label className="flex min-w-56 flex-1 flex-col gap-1.5 text-sm font-medium">
        Nombre de estudiante o tutor
        <div className="relative">
          <SearchIcon aria-hidden="true" className="text-muted-foreground absolute top-2.5 left-3 size-4" />
          <Input className="pl-9" onChange={(event) => onSearchChange(event.target.value)} placeholder="Buscar por nombre…" value={search} />
        </div>
      </label>
      <label className="flex min-w-44 flex-1 flex-col gap-1.5 text-sm font-medium">
        DNI
        <Input onChange={(event) => onDocumentNumberChange(event.target.value)} placeholder="Buscar por DNI…" value={documentNumber} />
      </label>
      <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm font-medium">
        Estado
        <Select onValueChange={onStatusChange} value={status}>
          <SelectTrigger aria-label="Filtrar por estado">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>
    </div>
  );
}

function RequestRow({
  request,
  institutionId,
  onResolve,
  onResolved,
  attachmentPathMode,
  showInstitution,
}: {
  request: GuardianLinkRequest;
  institutionId?: string;
  onResolve: (institutionId: string, linkId: string, decision: GuardianLinkDecision) => Promise<{ error?: string }>;
  onResolved: (requestId: string, status: GuardianLinkStatus) => void;
  attachmentPathMode: "institutional" | "platform";
  showInstitution: boolean;
}): React.ReactElement {
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const getAttachmentPath =
    attachmentPathMode === "platform"
      ? getPlatformGuardianLinkAttachmentContentPath
      : (_institutionId: string, linkId: string, attachmentId: string) => getGuardianLinkAttachmentContentPath(linkId, attachmentId);

  function resolve(decision: GuardianLinkDecision): void {
    const requestInstitutionId = institutionId ?? request.institution?.institutionId;

    if (!requestInstitutionId) {
      setError("La solicitud no tiene una institución asociada.");

      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        const result = await onResolve(requestInstitutionId, request.personGuardianId, decision);

        if (result.error) {
          setError(result.error);

          return;
        }

        onResolved(request.personGuardianId, decision === "approve" ? GUARDIAN_LINK_STATUS.ACTIVE : GUARDIAN_LINK_STATUS.REJECTED);
      } catch {
        setError("No se pudo resolver la solicitud.");
      }
    });
  }

  return (
    <TableRow>
      {showInstitution ? <TableCell>{request.institution?.name ?? "Sin institución"}</TableCell> : null}
      <TableCell>
        <PersonCell person={request.tutor} />
      </TableCell>
      <TableCell>
        <PersonCell person={request.dependent} />
        <div className="text-muted-foreground mt-1 text-xs">
          {request.dependent.birthDate ? formatDisplayDate(request.dependent.birthDate) : "Sin fecha de nacimiento"} ·{" "}
          {formatAge(request.dependent.birthDate)}
        </div>
      </TableCell>
      <TableCell>{GUARDIAN_RELATIONSHIP_LABELS[request.relationship]}</TableCell>
      <TableCell>{formatApplicationDateTime(request.createdAt)}</TableCell>
      <TableCell>
        {request.attachments.length > 0 ? (
          <div className="flex max-w-56 flex-col gap-1">
            {request.attachments.map((attachment) => (
              <a
                className="text-primary inline-flex items-center gap-1.5 truncate hover:underline"
                href={getAttachmentPath(request.institution?.institutionId ?? institutionId ?? "", request.personGuardianId, attachment.id)}
                key={attachment.id}
                rel="noreferrer"
                target="_blank"
              >
                <FileTextIcon aria-hidden="true" className="size-4 shrink-0" />
                {attachment.originalFileName}
              </a>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground">Sin documentación</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={
            request.status === GUARDIAN_LINK_STATUS.ACTIVE
              ? "success"
              : request.status === GUARDIAN_LINK_STATUS.REJECTED
                ? "destructive"
                : "secondary"
          }
        >
          {STATUS_LABELS[request.status]}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        {request.status === GUARDIAN_LINK_STATUS.PENDING ? (
          <div className="flex justify-end gap-2">
            <Button disabled={isPending} onClick={() => resolve("reject")} size="sm" type="button" variant="outline">
              <XIcon aria-hidden="true" />
              Rechazar
            </Button>
            <Button disabled={isPending} onClick={() => resolve("approve")} size="sm" type="button">
              <CheckIcon aria-hidden="true" />
              Aceptar
            </Button>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Sin acciones</span>
        )}
        {error ? (
          <Alert className="mt-2 text-left" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
      </TableCell>
    </TableRow>
  );
}

function PersonCell({ person }: { person: GuardianLinkPerson }): React.ReactElement {
  return (
    <div>
      <div className="font-medium">{getGuardianDependentName(person)}</div>
      <div className="text-muted-foreground text-xs">DNI {person.documentNumber}</div>
    </div>
  );
}

function EmptyRequests({ hasFilters }: { hasFilters: boolean }): React.ReactElement {
  const Icon = hasFilters ? SearchIcon : UsersIcon;

  return (
    <Empty className="bg-muted/25 min-h-80 rounded-lg border border-solid px-4 py-12">
      <EmptyHeader className="max-w-md">
        <EmptyMedia variant="icon">
          <Icon aria-hidden="true" className="size-5" />
        </EmptyMedia>
        <EmptyTitle className="mt-2 text-base">{hasFilters ? "No se encontraron solicitudes" : "No hay solicitudes de vinculación"}</EmptyTitle>
        <EmptyDescription>
          {hasFilters
            ? "No encontramos solicitudes que coincidan con los filtros."
            : "Cuando un tutor solicite vincularse, la solicitud aparecerá acá para validarla."}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

function formatAge(birthDate: string | null): string {
  const age = calculateAge(birthDate ?? undefined);

  return age === null ? "Edad no disponible" : `${age} años`;
}
