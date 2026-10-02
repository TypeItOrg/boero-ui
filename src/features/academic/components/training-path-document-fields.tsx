"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { FileTextIcon, PlusIcon, ExternalLinkIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@common/components/ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@common/components/ui/empty";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { DocumentDefinitionPicker } from "@features/document-catalog/components/document-definition-picker";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { getDocumentCatalogPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { documentRequirementSchema } from "@features/enrollment-applications/schemas/document-requirement.schema";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

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
}): React.ReactElement {
  const [drafts, setDrafts] = React.useState<TrainingPathDocumentDraft[]>(() =>
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
  const [editing, setEditing] = React.useState<TrainingPathDocumentDraft | null | undefined>();
  const [dialogBusy, setDialogBusy] = React.useState(false);
  const opener = React.useRef<HTMLButtonElement | null>(null);
  return (
    <section className="bg-muted/25 space-y-5 rounded-xl border p-4 sm:p-6" aria-label="Documentación requerida">
      <input type="hidden" name="documentRequirements" value={JSON.stringify(drafts)} />
      <SectionHeader
        icon={FileTextIcon}
        title="Documentación requerida para la inscripción"
        compactTitle="Documentación requerida"
        description="Seleccioná documentos compartidos y configurá su exigencia para este trayecto."
        action={
          canEdit ? (
            <Button
              size="lg"
              type="button"
              disabled={pending || !institutionId}
              onClick={(event) => {
                opener.current = event.currentTarget;
                setEditing(null);
              }}
            >
              <PlusIcon />
              Seleccionar documento
            </Button>
          ) : undefined
        }
      />
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {!institutionId ? <p className="text-muted-foreground text-sm">Seleccioná una institución antes de configurar documentación.</p> : null}
      {!canEdit ? <p className="text-muted-foreground text-sm">No tenés permisos para configurar estos requisitos.</p> : null}
      {drafts.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon />
            </EmptyMedia>
            <EmptyTitle>Sin documentación requerida</EmptyTitle>
            <EmptyDescription>Seleccioná documentos del catálogo para solicitarlos durante la inscripción.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {drafts.map((item) => (
        <article key={item.clientId} className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="font-medium break-words">{item.name}</h3>
              {!item.active ? <Badge variant="secondary">Asignación inactiva</Badge> : null}
            </div>
            <p className="text-muted-foreground mb-2 text-sm">
              {DOCUMENT_LEVEL_LABELS[item.level]} · Orden {item.displayOrder} · {formatDocumentFileCategories(item.allowedFormats)}
            </p>
            {item.documentActive === false ? (
              <p className="text-muted-foreground text-sm">Documento inactivo en el catálogo: no se exige en los borradores.</p>
            ) : null}
            {item.instructions ? <p className="text-muted-foreground text-sm break-words whitespace-pre-wrap">{item.instructions}</p> : null}
            {item.specificInstructions ? (
              <p className="text-muted-foreground text-sm break-words whitespace-pre-wrap">Para este trayecto: {item.specificInstructions}</p>
            ) : null}
          </div>
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Button
                size="lg"
                type="button"
                variant="outline"
                disabled={pending}
                onClick={(event) => {
                  opener.current = event.currentTarget;
                  setEditing(item);
                }}
              >
                Configurar requisito
              </Button>
              <Button
                size="lg"
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() =>
                  setDrafts((previous) =>
                    item.id || savedRequirementIds[item.clientId]
                      ? previous.map((value) => (value.clientId === item.clientId ? { ...value, active: !value.active, dirty: true } : value))
                      : previous.filter((value) => value.clientId !== item.clientId),
                  )
                }
              >
                {item.active ? "Quitar" : "Reactivar"}
              </Button>
            </div>
          ) : null}
        </article>
      ))}
      {editing !== undefined && institutionId ? (
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open && !dialogBusy) {
              setEditing(undefined);
            }
          }}
        >
          <DialogContent
            className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
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
              opener.current?.focus();
            }}
          >
            <DialogHeader>
              <DialogTitle>{editing ? "Configurar requisito" : "Seleccionar documento"}</DialogTitle>
              <DialogDescription>
                La exigencia y las instrucciones específicas se aplican al guardar el trayecto. El documento del catálogo es compartido.
              </DialogDescription>
            </DialogHeader>
            <RequirementForm
              key={editing?.clientId ?? "new"}
              initial={editing ?? undefined}
              scope={scope}
              institutionId={institutionId}
              pathId={pathId}
              canManageCatalog={canManageCatalog}
              onSave={(value) => {
                const draft = { ...value, clientId: editing?.clientId ?? crypto.randomUUID(), id: editing?.id ?? null, dirty: true };
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
      ) : null}
    </section>
  );
}

function RequirementForm({
  initial,
  scope,
  institutionId,
  pathId,
  canManageCatalog,
  onSave,
  onCancel,
  existing,
  onPendingChange,
}: {
  initial?: TrainingPathDocumentDraft;
  scope: AcademicScope;
  institutionId: string;
  pathId?: string;
  canManageCatalog: boolean;
  onSave: (draft: Omit<TrainingPathDocumentDraft, "clientId" | "id" | "dirty">) => void;
  onCancel: () => void;
  existing: TrainingPathDocumentDraft[];
  onPendingChange: (pending: boolean) => void;
}): React.ReactElement {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [document, setDocument] = React.useState<DocumentDefinition | undefined>(
    initial?.documentId
      ? {
          id: initial.documentId,
          institutionId,
          name: initial.name,
          instructions: initial.instructions,
          allowedFormats: initial.allowedFormats,
          active: initial.documentActive !== false,
          revision: 0,
        }
      : undefined,
  );
  const [creating, setCreating] = React.useState(false);
  const selectDocument = React.useCallback((value: DocumentDefinition) => {
    setDocument(value);
    setCreating(false);
  }, []);
  const [state, action, pending] = React.useActionState(async (_previous: { error?: string }, form: FormData): Promise<{ error?: string }> => {
    const parsed = documentRequirementSchema.safeParse({
      documentId: document?.id,
      revision: initial?.revision,
      name: document?.name,
      instructions: document?.instructions,
      allowedFormats: document?.allowedFormats,
      specificInstructions: form.get("specificInstructions"),
      level: form.get("level"),
      displayOrder: /^\d+$/.test(String(form.get("displayOrder"))) ? Number(form.get("displayOrder")) : undefined,
      active: form.get("active") === "true" ? true : form.get("active") === "false" ? false : undefined,
    });
    if (!parsed.success) {
      return { error: "Seleccioná un documento y revisá su configuración." };
    }
    const duplicate = existing.find((item) => item.documentId === parsed.data.documentId && item.clientId !== initial?.clientId);
    if (duplicate) {
      return { error: "Este documento ya está configurado. Cerrá este diálogo y reactivá o editá su requisito existente." };
    }
    onSave({ ...parsed.data, documentActive: document?.active });
    return {};
  }, {});
  if (creating) {
    return (
      <DocumentCatalogForm
        scope={scope}
        institutionId={institutionId}
        allowAssignments={false}
        onPendingChange={onPendingChange}
        onSaved={selectDocument}
        onCancel={() => setCreating(false)}
      />
    );
  }
  return (
    <ActionForm action={action} className="space-y-4">
      {state.error ? (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {initial ? (
        <h3 className="font-medium">{initial.name}</h3>
      ) : (
        <>
          <DocumentDefinitionPicker
            scope={scope}
            institutionId={institutionId}
            trainingPathId={pathId}
            forTrainingPathCreation={!pathId}
            value={document}
            onSelect={selectDocument}
            disabled={pending}
          />
          {canManageCatalog ? (
            <Button size="lg" type="button" variant="outline" onClick={() => setCreating(true)}>
              Crear documento en el catálogo
            </Button>
          ) : null}
        </>
      )}
      {document ? (
        <div className="bg-muted/30 space-y-2 rounded-lg p-3 text-sm">
          <p className="whitespace-pre-wrap">{document.instructions || "Sin instrucciones generales"}</p>
          <p>{formatDocumentFileCategories(document.allowedFormats)}</p>
          {canManageCatalog ? (
            <Button size="lg" asChild type="button" variant="link" className="w-full justify-start whitespace-normal">
              <Link
                target="_blank"
                rel="noreferrer"
                href={`${getDocumentCatalogPageUrl(scope, institutionId)}${scope === "admin" ? "&" : "?"}documentId=${document.id}&returnTo=${encodeURIComponent(pathname + (searchParams.toString() ? "?" + searchParams.toString() : ""))}`}
              >
                <ExternalLinkIcon />
                Editar definición compartida en el catálogo
              </Link>
            </Button>
          ) : null}
        </div>
      ) : null}
      <FormField name="level" label="Exigencia">
        <FormSelect
          name="level"
          defaultValue={initial?.level ?? "AT_SUBMISSION"}
          options={Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
          disabled={pending}
        />
      </FormField>
      <FormField name="requirement-order" label="Orden">
        <Input
          id="requirement-order"
          name="displayOrder"
          type="number"
          min={0}
          max={2147483647}
          defaultValue={initial?.displayOrder ?? 0}
          required
          disabled={pending}
        />
      </FormField>
      <FormField name="requirement-specific" label="Instrucciones específicas del trayecto">
        <Textarea
          id="requirement-specific"
          name="specificInstructions"
          defaultValue={initial?.specificInstructions ?? ""}
          maxLength={1000}
          disabled={pending}
        />
      </FormField>
      <FormField name="requirement-active" label="Asignación">
        <FormSelect
          name="active"
          id="requirement-active"
          defaultValue={String(initial?.active ?? true)}
          options={[
            { value: "true", label: "Activa" },
            { value: "false", label: "Inactiva" },
          ]}
          disabled={pending}
        />
      </FormField>
      <DialogFooter className="mt-6">
        <Button size="lg" type="button" variant="outline" disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="lg" type="submit" disabled={pending || !document}>
          Configurar requisito
        </Button>
      </DialogFooter>
    </ActionForm>
  );
}
