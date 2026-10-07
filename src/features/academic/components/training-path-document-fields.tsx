"use client";

import * as React from "react";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { FileTextIcon, PlusIcon, ExternalLinkIcon, RotateCcwIcon, SlidersHorizontalIcon, Trash2Icon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@common/components/ui/dialog";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@common/components/ui/empty";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";
import { appendReturnTo } from "@common/utils/return-to.util";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { DocumentDefinitionPicker } from "@features/document-catalog/components/document-definition-picker";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { getDocumentCatalogEditPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { documentRequirementFormSchema } from "@features/enrollment-applications/schemas/document-requirement.schema";
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
  const [creating, setCreating] = React.useState(false);
  const [dialogBusy, setDialogBusy] = React.useState(false);
  const opener = React.useRef<HTMLButtonElement | null>(null);
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
                  opener.current = event.currentTarget;
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
              <Card role="article" aria-labelledby={`document-requirement-${item.clientId}`}>
                <CardHeader className="flex flex-row items-stretch gap-3">
                  <div className="bg-primary/10 text-primary flex w-11 shrink-0 items-center justify-center rounded-lg">
                    <FileTextIcon className="size-5" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
                      <CardTitle className="flex min-w-0 items-center gap-1">
                        <h3 id={`document-requirement-${item.clientId}`} className="min-w-0 break-words">
                          {item.name}
                        </h3>
                        <div className="hidden shrink-0 @3xl/document-requirement:flex">
                          <TrainingPathDocumentInstructions
                            name={item.name}
                            instructions={item.instructions}
                            specificInstructions={item.specificInstructions}
                            className="size-6"
                          />
                        </div>
                      </CardTitle>
                      {!item.active ? <Badge variant="secondary">Asignación inactiva</Badge> : null}
                    </div>
                    <CardDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{formatDocumentFileCategories(item.allowedFormats)}</span>
                      <Badge variant="outline" className="h-auto max-w-full whitespace-normal">
                        {DOCUMENT_LEVEL_LABELS[item.level]}
                      </Badge>
                    </CardDescription>
                  </div>
                </CardHeader>
                {item.documentActive === false || item.instructions?.trim() || item.specificInstructions?.trim() ? (
                  <CardContent className={item.documentActive === false ? "space-y-3" : "space-y-3 @3xl/document-requirement:hidden"}>
                    <dl className="space-y-3 empty:hidden @3xl/document-requirement:hidden">
                      {item.instructions?.trim() ? (
                        <div className="min-w-0 space-y-1">
                          <dt className="text-muted-foreground">{item.specificInstructions?.trim() ? "Instrucciones generales" : "Instrucciones"}</dt>
                          <dd className="leading-relaxed break-words whitespace-pre-wrap">{item.instructions}</dd>
                        </div>
                      ) : null}
                      {item.specificInstructions?.trim() ? (
                        <div className="min-w-0 space-y-1">
                          <dt className="text-muted-foreground">Instrucciones del trayecto</dt>
                          <dd className="leading-relaxed break-words whitespace-pre-wrap">{item.specificInstructions}</dd>
                        </div>
                      ) : null}
                    </dl>
                    {item.documentActive === false ? (
                      <p className="text-muted-foreground text-sm">Documento inactivo en el catálogo: no se exige en los borradores.</p>
                    ) : null}
                  </CardContent>
                ) : null}
                {canEdit ? (
                  <CardFooter className="justify-end py-3">
                    <div className="grid w-full grid-cols-2 gap-2 @3xl/document-requirement:flex @3xl/document-requirement:w-auto">
                      <Button
                        size="lg"
                        className="min-w-0"
                        type="button"
                        variant="secondary"
                        aria-label={`Configurar requisito de ${item.name}`}
                        disabled={pending}
                        onClick={(event) => {
                          opener.current = event.currentTarget;
                          setCreating(false);
                          setEditing(item);
                        }}
                      >
                        <SlidersHorizontalIcon className="hidden @3xl/document-requirement:block" aria-hidden="true" />
                        Configurar
                      </Button>
                      <Button
                        size="lg"
                        className="border-border bg-background min-w-0 @3xl/document-requirement:border-transparent @3xl/document-requirement:bg-transparent"
                        type="button"
                        variant="ghost"
                        aria-label={item.active ? `Quitar ${item.name} del trayecto` : `Reactivar requisito de ${item.name}`}
                        disabled={pending}
                        onClick={() =>
                          setDrafts((previous) =>
                            item.id || savedRequirementIds[item.clientId]
                              ? previous.map((value) => (value.clientId === item.clientId ? { ...value, active: !value.active, dirty: true } : value))
                              : previous.filter((value) => value.clientId !== item.clientId),
                          )
                        }
                      >
                        {item.active ? (
                          <Trash2Icon className="hidden @3xl/document-requirement:block" aria-hidden="true" />
                        ) : (
                          <RotateCcwIcon className="hidden @3xl/document-requirement:block" aria-hidden="true" />
                        )}
                        {item.active ? "Quitar" : "Reactivar"}
                      </Button>
                    </div>
                  </CardFooter>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      ) : null}
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
              opener.current?.focus();
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
  creating,
  onCreatingChange,
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
  creating: boolean;
  onCreatingChange: (creating: boolean) => void;
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
  const selectDocument = React.useCallback(
    (value: DocumentDefinition) => {
      setDocument(value);
      onCreatingChange(false);
    },
    [onCreatingChange],
  );
  const [state, action, pending] = React.useActionState(async (_previous: { error?: string }, form: FormData): Promise<{ error?: string }> => {
    const parsed = documentRequirementFormSchema.safeParse({
      documentId: document?.id,
      revision: initial?.revision,
      name: document?.name,
      instructions: document?.instructions,
      allowedFormats: document?.allowedFormats,
      specificInstructions: form.get("specificInstructions"),
      level: form.get("level"),
      displayOrder: form.get("displayOrder"),
      active: form.get("active"),
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
        layout="dialog"
        onPendingChange={onPendingChange}
        onSaved={selectDocument}
        onCancel={() => onCreatingChange(false)}
      />
    );
  }
  return (
    <ActionForm action={action} className="flex min-h-0 flex-1 flex-col">
      <div className="-mx-4 min-h-0 space-y-5 overflow-y-auto px-4 pb-5">
        {state.error ? (
          <Alert variant="destructive">
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}
        {initial && !document ? <h3 className="font-medium break-words">{initial.name}</h3> : null}
        {!initial ? (
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
              <Button size="lg" type="button" variant="outline" className="w-full" onClick={() => onCreatingChange(true)}>
                <PlusIcon data-icon="inline-start" aria-hidden="true" />
                Crear documento en el catálogo
              </Button>
            ) : null}
          </>
        ) : null}
        {document ? (
          <Card className="bg-muted/20 gap-3 border ring-0" role="group" aria-label="Documento del catálogo">
            <CardHeader className="flex flex-row items-stretch gap-3">
              <div className="bg-primary/10 text-primary flex w-11 shrink-0 items-center justify-center rounded-lg">
                <FileTextIcon className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="flex min-w-0 items-center gap-1">
                  <h3 className="min-w-0 break-words">{document.name}</h3>
                  <TrainingPathDocumentInstructions name={document.name} instructions={document.instructions} className="size-6" />
                </CardTitle>
                <CardDescription>{formatDocumentFileCategories(document.allowedFormats)}</CardDescription>
              </div>
            </CardHeader>
            {canManageCatalog ? (
              <CardFooter className="py-3">
                <Button size="lg" asChild type="button" variant="outline" className="w-full justify-start gap-2">
                  <Link
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Editar definición compartida de ${document.name} en el catálogo (se abre en una nueva pestaña)`}
                    href={appendReturnTo(
                      getDocumentCatalogEditPageUrl(scope, institutionId, document.id),
                      pathname + (searchParams.toString() ? "?" + searchParams.toString() : ""),
                    )}
                  >
                    <span>Editar en el catálogo</span>
                    <ExternalLinkIcon data-icon="inline-end" className="text-muted-foreground ml-auto size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </CardFooter>
            ) : null}
          </Card>
        ) : null}
        <FormField name="level" label="Exigencia">
          <FormSelect
            name="level"
            defaultValue={initial?.level ?? "AT_SUBMISSION"}
            options={Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
            disabled={pending}
          />
        </FormField>
        <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
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
          <FormField name="requirement-order" label="Orden" required>
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
        </div>
        <FormField name="requirement-specific" label="Instrucciones específicas del trayecto">
          <Textarea
            id="requirement-specific"
            name="specificInstructions"
            defaultValue={initial?.specificInstructions ?? ""}
            maxLength={1000}
            disabled={pending}
            rows={3}
          />
        </FormField>
      </div>
      <DialogFooter className="mt-0 shrink-0">
        <Button size="lg" type="button" variant="outline" className="h-11 sm:h-9" disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button size="lg" type="submit" className="h-11 sm:h-9" disabled={pending || !document}>
          Configurar requisito
        </Button>
      </DialogFooter>
    </ActionForm>
  );
}
