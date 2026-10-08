"use client";

import { useRef, useState, type ReactElement } from "react";

import { FileTextIcon, PlusIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

import { TrainingPathDocumentRequirementCard } from "@features/academic/components/training-path-document-requirement-card";
import { TrainingPathDocumentRequirementDialog } from "@features/academic/components/training-path-document-requirement-dialog";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export function TrainingPathDocumentFields({
  requirements = [],
  canEdit = true,
  pending,
  error,
  savedRequirementIds = {},
  scope = "institutional",
  institutionId,
  pathId,
  canManageCatalog = false,
}: {
  requirements?: DocumentRequirement[];
  canEdit?: boolean;
  pending: boolean;
  error?: string;
  savedRequirementIds?: Record<string, string>;
  scope?: AcademicScope;
  institutionId?: string;
  pathId?: string;
  canManageCatalog?: boolean;
}): ReactElement {
  const [drafts, setDrafts] = useState<TrainingPathDocumentDraft[]>(() =>
    requirements.map((item) => ({
      ...item,
      clientId: item.id,
      id: item.id,
      documentId: item.documentId,
      revision: item.revision,
      specificInstructions: item.specificInstructions ?? null,
      active: item.active !== false,
      dirty: false,
    })),
  );
  const [editing, setEditing] = useState<TrainingPathDocumentDraft | null | undefined>();
  const [creating, setCreating] = useState(false);
  const [dialogBusy, setDialogBusy] = useState(false);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const orderedDrafts = [...drafts].sort((left, right) => left.displayOrder - right.displayOrder);

  return (
    <section className="bg-muted/25 space-y-5 rounded-xl border p-5 md:p-6" aria-label="Documentación requerida">
      <input type="hidden" name="documentRequirements" value={JSON.stringify(drafts)} />
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={FileTextIcon}
          title="Documentación requerida para la inscripción"
          compactTitle="Documentación requerida"
          description="Seleccioná documentos compartidos y configurá su exigencia para este trayecto."
          actionClassName="@xl/section-header:self-stretch"
          action={
            canEdit ? (
              <Button
                size="lg"
                className="h-11 w-full @xl/section-header:h-full @xl/section-header:w-11"
                type="button"
                aria-label="Seleccionar documento"
                title="Seleccionar documento"
                disabled={pending || !institutionId}
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setCreating(false);
                  setEditing(null);
                }}
              >
                <PlusIcon aria-hidden="true" />
                <span className="@xl/section-header:hidden">Seleccionar documento</span>
              </Button>
            ) : undefined
          }
        />
      </header>
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {!institutionId ? <p className="text-muted-foreground text-sm">Seleccioná una institución antes de configurar documentación.</p> : null}
      {!canEdit ? <p className="text-muted-foreground text-sm">No tenés permisos para configurar estos requisitos.</p> : null}
      {drafts.length === 0 ? (
        <Empty className="bg-muted/25 min-h-80 rounded-lg border border-solid px-4 py-12">
          <EmptyHeader className="max-w-md">
            <EmptyMedia variant="icon">
              <FileTextIcon className="size-5" aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="mt-2 text-base">Sin documentación requerida</EmptyTitle>
            <EmptyDescription>Seleccioná documentos del catálogo para solicitarlos durante la inscripción.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {drafts.length > 0 ? (
        <ul className="grid gap-4">
          {orderedDrafts.map((item) => (
            <li key={item.clientId} className="@container/document-requirement min-w-0">
              <TrainingPathDocumentRequirementCard
                item={item}
                canEdit={canEdit}
                pending={pending}
                openerRef={openerRef}
                setCreating={setCreating}
                setEditing={setEditing}
                setDrafts={setDrafts}
                savedRequirementIds={savedRequirementIds}
              />
            </li>
          ))}
        </ul>
      ) : null}
      {editing !== undefined && institutionId ? (
        <TrainingPathDocumentRequirementDialog
          dialogBusy={dialogBusy}
          setEditing={setEditing}
          editing={editing}
          creating={creating}
          openerRef={openerRef}
          scope={scope}
          institutionId={institutionId}
          pathId={pathId}
          canManageCatalog={canManageCatalog}
          setCreating={setCreating}
          setDrafts={setDrafts}
          drafts={drafts}
          setDialogBusy={setDialogBusy}
        />
      ) : null}
    </section>
  );
}
