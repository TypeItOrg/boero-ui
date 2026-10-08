"use client";

import type { ReactElement } from "react";

import { ArchiveIcon, PencilLineIcon, PlusIcon, RotateCcwIcon } from "lucide-react";

import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";

export function DocumentChanges({ requirement }: { requirement: DocumentRequirement }): ReactElement {
  const changes = [...(requirement.changes ?? [])].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const events: Record<string, { title: string; icon: typeof PlusIcon }> = {
    ADDED: { title: "Requisito agregado", icon: PlusIcon },
    UPDATED: { title: "Requisito actualizado", icon: PencilLineIcon },
    RETIRED: { title: "Requisito retirado", icon: ArchiveIcon },
    REACTIVATED: { title: "Requisito reactivado", icon: RotateCcwIcon },
  };

  if (changes.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PencilLineIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No hay cambios registrados</EmptyTitle>
          <EmptyDescription>Las actualizaciones de este requisito van a aparecer acá.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ol className="space-y-6" aria-label="Cambios del requisito">
      {changes.map((change, index) => {
        const event = events[change.action] ?? { title: "Cambio registrado", icon: PencilLineIcon };
        const Icon = event.icon;

        return (
          <li key={`${change.occurredAt}-${index}`} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
            {index < changes.length - 1 ? <span aria-hidden="true" className="bg-border absolute top-10 -bottom-6 left-5 w-px" /> : null}
            <span className="bg-muted text-muted-foreground relative flex size-10 items-center justify-center rounded-lg">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1 pt-0.5">
              <h3 className="text-sm font-medium">{event.title}</h3>
              <time className="text-muted-foreground block text-xs" dateTime={change.occurredAt}>
                {formatEnrollmentApplicationDateTime(change.occurredAt)}
              </time>
              {change.name !== requirement.name ? <p className="pt-1 text-sm break-words">Documento: {change.name}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
