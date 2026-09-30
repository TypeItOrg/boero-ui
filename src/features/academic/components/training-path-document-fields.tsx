"use client";
import * as React from "react";
import { ChevronDownIcon, FileTextIcon, PlusIcon } from "lucide-react";
import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@common/components/ui/dialog";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { TrainingPathDocumentDraft } from "@features/academic/types/training-path-document-draft.types";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";
import {
  DOCUMENT_FILE_CATEGORIES,
  DOCUMENT_LEVEL_LABELS,
  DOCUMENT_MESSAGES,
} from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";
import { parseDocumentRequirementForm } from "@features/enrollment-applications/schemas/document-requirement.schema";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

export function TrainingPathDocumentFields({
  requirements = [],
  canEdit = true,
  pending,
  error,
  savedRequirementIds = {},
}: {
  requirements?: DocumentRequirement[];
  canEdit?: boolean;
  pending: boolean;
  error?: string;
  savedRequirementIds?: Record<string, string>;
}): React.ReactElement {
  const [drafts, setDrafts] = React.useState<TrainingPathDocumentDraft[]>(() =>
    requirements.map((item) => ({
      clientId: item.id,
      id: item.id,
      name: item.name,
      instructions: item.instructions,
      level: item.level,
      allowedFormats: item.allowedFormats,
      displayOrder: item.displayOrder,
      active: item.active !== false,
      dirty: false,
    })),
  );
  const [editing, setEditing] = React.useState<TrainingPathDocumentDraft | null | undefined>(undefined);
  const openerRef = React.useRef<HTMLButtonElement | null>(null);
  return (
    <section
      id="enrollment-documentation"
      aria-labelledby="document-requirements-title"
      className="bg-muted/25 space-y-5 rounded-xl border p-4 sm:p-5 md:p-6"
    >
      <input type="hidden" name="documentRequirements" value={JSON.stringify(drafts)} />
      <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={FileTextIcon}
          titleId="document-requirements-title"
          title="Documentación requerida para la inscripción"
          compactTitle="Documentación requerida"
          description="Definí qué documentos se solicitan, cuándo se presentan y qué tipos de archivo se admiten."
          compactDescription="Definí qué documentos se pedirán al inscribirse."
          action={
            canEdit ? (
              <Button
                type="button"
                size="lg"
                className="h-11 w-full transition-colors @xl/section-header:w-11"
                aria-label="Agregar documento requerido"
                disabled={pending}
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setEditing(null);
                }}
              >
                <PlusIcon aria-hidden="true" />
                <span className="@xl/section-header:sr-only">Agregar documento</span>
              </Button>
            ) : null
          }
        />
      </header>
      {!canEdit ? <p className="text-muted-foreground text-sm">No tenés permisos para configurar requisitos documentales.</p> : null}
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
      {drafts.length === 0 ? (
        <Empty className="rounded-lg px-4 py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileTextIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle className="text-base">Sin documentación requerida</EmptyTitle>
            <EmptyDescription>La inscripción no solicitará documentos mientras no haya requisitos activos.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : null}
      {drafts.map((item) => (
        <article key={item.clientId} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
          <div className="min-w-0 flex-[1_0_100%] sm:flex-1">
            <h3 className="font-medium break-words">
              {item.name}
              {!item.active ? " · Inactivo" : ""}
            </h3>
            <p className="text-muted-foreground text-sm">
              {DOCUMENT_LEVEL_LABELS[item.level]} · Orden {item.displayOrder} · {formatDocumentFileCategories(item.allowedFormats)}
            </p>
            <p className="text-sm break-words whitespace-pre-wrap">{item.instructions}</p>
          </div>
          {canEdit ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={(event) => {
                  openerRef.current = event.currentTarget;
                  setEditing(item);
                }}
              >
                Editar
              </Button>
              {!item.id && !savedRequirementIds[item.clientId] ? (
                <Button
                  type="button"
                  variant="outline"
                  disabled={pending}
                  onClick={() => setDrafts((current) => current.filter((draft) => draft.clientId !== item.clientId))}
                >
                  Quitar
                </Button>
              ) : null}
            </div>
          ) : null}
        </article>
      ))}
      {editing !== undefined ? (
        <RequirementForm
          initial={editing}
          onClose={() => setEditing(undefined)}
          onRestoreFocus={() => openerRef.current?.focus()}
          onSave={(value) => {
            const draft: TrainingPathDocumentDraft = {
              ...value,
              clientId: editing?.clientId ?? crypto.randomUUID(),
              id: editing?.id ?? null,
              dirty: true,
            };
            setDrafts((current) => (editing ? current.map((item) => (item.clientId === editing.clientId ? draft : item)) : [...current, draft]));
            setEditing(undefined);
          }}
        />
      ) : null}
    </section>
  );
}
function RequirementForm({
  initial,
  onClose,
  onRestoreFocus,
  onSave,
}: {
  initial: TrainingPathDocumentDraft | null;
  onClose: () => void;
  onRestoreFocus: () => void;
  onSave: (value: Omit<TrainingPathDocumentDraft, "clientId" | "id" | "dirty">) => void;
}): React.ReactElement {
  const [allowedFormats, setAllowedFormats] = React.useState<string[]>(
    () => initial?.allowedFormats ?? DOCUMENT_FILE_CATEGORIES.flatMap((category) => [...category.formats]),
  );
  const [state, action, pending] = React.useActionState(async (_previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
    const parsed = parseDocumentRequirementForm(form);
    if (!parsed.success) {
      return { error: DOCUMENT_MESSAGES.invalid };
    }

    onSave(parsed.data);
    return { success: true };
  }, {});
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="data-open:zoom-in-100 data-closed:zoom-out-100 top-0 bottom-0 my-auto flex h-fit max-h-[calc(100dvh-2rem)] translate-y-0 flex-col overflow-hidden p-5 text-sm sm:max-w-lg"
        onInteractOutside={(event) => {
          if (pending) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (pending) {
            event.preventDefault();
          }
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onRestoreFocus();
        }}
      >
        <ActionForm action={action} className="flex min-h-0 flex-col">
          <DialogHeader className="shrink-0 items-center gap-1.5 pb-5 text-center">
            <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
              <FileTextIcon className="size-6" aria-hidden="true" />
            </div>
            <DialogTitle className="font-semibold">{initial ? "Editar documento requerido" : "Agregar documento requerido"}</DialogTitle>
            <DialogDescription className="text-balance">Los cambios se aplicarán al guardar el trayecto formativo.</DialogDescription>
          </DialogHeader>
          <div className="-mx-1 min-h-0 space-y-4 overflow-y-auto px-1 pb-5">
            <FormField name="document-requirement-name" label="Nombre" required>
              <Input id="document-requirement-name" name="name" defaultValue={initial?.name ?? ""} maxLength={150} required disabled={pending} />
            </FormField>
            <FormField name="document-requirement-instructions" label="Instrucciones">
              <Textarea
                id="document-requirement-instructions"
                name="instructions"
                defaultValue={initial?.instructions ?? ""}
                maxLength={1000}
                rows={3}
                disabled={pending}
              />
            </FormField>
            <FormField name="level" label="Exigencia">
              <FormSelect
                name="level"
                defaultValue={initial?.level ?? "AT_SUBMISSION"}
                options={Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
                disabled={pending}
              />
            </FormField>
            <FormField name="document-requirement-file-types" label="Tipos de archivo admitidos">
              {allowedFormats.map((format) => (
                <input key={format} type="hidden" name="allowedFormats" value={format} />
              ))}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="document-requirement-file-types"
                    aria-describedby="document-requirement-file-types-value"
                    type="button"
                    variant="outline"
                    disabled={pending}
                    className="h-9 w-full justify-between px-2.5 text-base font-normal md:text-sm"
                  >
                    <span
                      id="document-requirement-file-types-value"
                      className={allowedFormats.length === 0 ? "text-muted-foreground truncate" : "truncate"}
                    >
                      {allowedFormats.length > 0 ? formatDocumentFileCategories(allowedFormats) : "Seleccionar tipos"}
                    </span>
                    <ChevronDownIcon className="text-muted-foreground size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-(--radix-dropdown-menu-trigger-width)" aria-label="Tipos de archivo admitidos">
                  {DOCUMENT_FILE_CATEGORIES.map((category) => (
                    <DropdownMenuCheckboxItem
                      key={category.value}
                      className="min-h-9 px-2.5 pr-8"
                      checked={
                        category.formats.every((format) => allowedFormats.includes(format))
                          ? true
                          : category.formats.some((format) => allowedFormats.includes(format))
                            ? "indeterminate"
                            : false
                      }
                      onSelect={(event) => event.preventDefault()}
                      onCheckedChange={(checked) => {
                        setAllowedFormats((current) => [
                          ...current.filter((format) => !category.formats.some((categoryFormat) => categoryFormat === format)),
                          ...(checked === true ? category.formats : []),
                        ]);
                      }}
                      disabled={pending}
                    >
                      {category.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FormField>
            <div className="grid grid-cols-2 gap-4">
              <FormField name="document-requirement-order" label="Orden" required>
                <Input
                  id="document-requirement-order"
                  name="displayOrder"
                  type="number"
                  min={0}
                  step={1}
                  defaultValue={initial?.displayOrder ?? 0}
                  required
                  disabled={pending}
                />
              </FormField>
              <FormField name="active" label="Estado">
                <FormSelect
                  name="active"
                  defaultValue={initial?.active === false ? "false" : "true"}
                  options={[
                    { value: "true", label: "Activo" },
                    { value: "false", label: "Inactivo" },
                  ]}
                  disabled={pending}
                />
              </FormField>
            </div>
            {state.error ? (
              <p className="text-destructive text-sm" role="alert">
                {state.error}
              </p>
            ) : null}
          </div>
          <DialogFooter className="-mx-5 -mb-5 shrink-0 p-3.5">
            <Button type="button" variant="outline" size="lg" disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={pending}>
              {pending ? "Aplicando…" : initial ? "Aplicar cambios" : "Agregar documento"}
            </Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
