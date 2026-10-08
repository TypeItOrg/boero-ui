"use client";

import type { Dispatch, ReactElement, RefObject, SetStateAction } from "react";

import { FileTextIcon, SlidersHorizontalIcon } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@common/components/ui/dialog";

import { RequirementForm } from "@features/academic/components/training-path-document-requirement-form";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function TrainingPathDocumentRequirementDialog({
  dialogBusy,
  setEditing,
  editing,
  creating,
  openerRef,
  scope,
  institutionId,
  pathId,
  canManageCatalog,
  setCreating,
  setDrafts,
  drafts,
  setDialogBusy,
}: {
  dialogBusy: boolean;
  setEditing: Dispatch<SetStateAction<TrainingPathDocumentDraft | null | undefined>>;
  editing: TrainingPathDocumentDraft | null | undefined;
  creating: boolean;
  openerRef: RefObject<HTMLButtonElement | null>;
  scope: AcademicScope;
  institutionId: string;
  pathId: string | undefined;
  canManageCatalog: boolean;
  setCreating: Dispatch<SetStateAction<boolean>>;
  setDrafts: Dispatch<SetStateAction<TrainingPathDocumentDraft[]>>;
  drafts: TrainingPathDocumentDraft[];
  setDialogBusy: Dispatch<SetStateAction<boolean>>;
}): ReactElement {
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !dialogBusy) {
          setEditing(undefined);
        }
      }}
    >
      <DialogContent
        className="flex max-h-[90dvh] flex-col gap-5 overflow-hidden sm:max-w-xl"
        onOpenAutoFocus={(event) => {
          if (!editing || creating || !(event.target instanceof HTMLElement)) {
            return;
          }

          const levelControl = event.target.querySelector<HTMLElement>("#level");

          if (levelControl) {
            event.preventDefault();
            levelControl.focus();
          }
        }}
        onInteractOutside={(event) => {
          if (dialogBusy) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (dialogBusy) {
            event.preventDefault();
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          openerRef.current?.focus();
        }}
      >
        <DialogHeader className="shrink-0 items-center pt-2 text-center">
          <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
            {editing && !creating ? (
              <SlidersHorizontalIcon className="size-6" aria-hidden="true" />
            ) : (
              <FileTextIcon className="size-6" aria-hidden="true" />
            )}
          </div>
          <DialogTitle className="leading-snug font-semibold">
            {creating ? "Crear documento del catálogo" : editing ? "Configurar requisito" : "Seleccionar documento"}
          </DialogTitle>
          <DialogDescription className="max-w-sm text-pretty">
            {creating
              ? "Definí el nombre, las instrucciones y los archivos admitidos."
              : editing
                ? "Ajustá cómo se solicitará este documento."
                : "Seleccioná un documento y definí cómo se solicitará."}
          </DialogDescription>
        </DialogHeader>
        <RequirementForm
          key={editing?.clientId ?? "new"}
          initial={editing ?? undefined}
          scope={scope}
          institutionId={institutionId}
          pathId={pathId}
          canManageCatalog={canManageCatalog}
          creating={creating}
          onCreatingChange={setCreating}
          onSave={(value) => {
            const draft = {
              ...value,
              clientId: editing?.clientId ?? crypto.randomUUID(),
              id: editing?.id ?? null,
              dirty: true,
            };

            setDrafts((previous) =>
              editing
                ? previous.map((item) => (item.clientId === editing.clientId ? draft : item))
                : [...previous.filter((item) => item.documentId !== draft.documentId || item.active), draft],
            );
            setEditing(undefined);
          }}
          onCancel={() => setEditing(undefined)}
          existing={drafts}
          onPendingChange={setDialogBusy}
        />
      </DialogContent>
    </Dialog>
  );
}
