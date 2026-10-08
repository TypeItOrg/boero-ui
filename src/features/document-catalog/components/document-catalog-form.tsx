"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { ChevronDownIcon, CircleAlertIcon, FileTextIcon, GitBranchPlusIcon, Trash2Icon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { DialogFooter } from "@common/components/ui/dialog";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Input } from "@common/components/ui/input";
import { Skeleton } from "@common/components/ui/skeleton";
import { Textarea } from "@common/components/ui/textarea";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";
import { cn } from "@common/utils/cn.util";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { saveDocumentDefinition } from "@features/document-catalog/actions/save-document-definition.action";
import { DocumentCatalogAssignmentsEmptyState } from "@features/document-catalog/components/document-catalog-assignments-empty-state";
import { DocumentCatalogSaveConfirmation } from "@features/document-catalog/components/document-catalog-save-confirmation";
import { DOCUMENT_CATALOG_STATE_OPTIONS } from "@features/document-catalog/constants/document-catalog.constants";
import { documentDefinitionSchema } from "@features/document-catalog/schemas/document-catalog.schema";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentDefinitionDefaults } from "@features/document-catalog/types/document-definition-defaults.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { DOCUMENT_FILE_CATEGORIES, DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

const requiredDocumentFieldsSchema = documentDefinitionSchema.pick({ name: true, allowedFormats: true });

export function DocumentCatalogForm({
  scope,
  institutionId,
  institutionField,
  targetInstitutionId,
  copySourceInstitutionId,
  defaults,
  initial,
  onSaved,
  onCancel,
  onPendingChange,
  returnTo,
  allowAssignments = true,
  layout = "page",
}: {
  scope: AcademicScope;
  institutionId?: string;
  institutionField?: React.ReactNode;
  targetInstitutionId?: string;
  copySourceInstitutionId?: string;
  defaults?: DocumentDefinitionDefaults;
  initial?: DocumentDefinition;
  onSaved?: (document: DocumentDefinition) => void;
  onCancel?: () => void;
  onPendingChange?: (pending: boolean) => void;
  returnTo?: string;
  allowAssignments?: boolean;
  layout?: "page" | "dialog";
}): React.ReactElement {
  const router = useRouter();
  const [name, setName] = React.useState(initial?.name ?? defaults?.name ?? "");
  const [allowedFormats, setAllowedFormats] = React.useState<string[]>(
    () => initial?.allowedFormats ?? defaults?.allowedFormats ?? DOCUMENT_FILE_CATEGORIES.flatMap((category) => [...category.formats]),
  );
  const [changes, setChanges] = React.useState<Record<string, DocumentAssignment>>({});
  const [removedAssignments, setRemovedAssignments] = React.useState<Record<string, DocumentAssignment>>({});
  const [confirmationData, setConfirmationData] = React.useState<FormData>();
  const [confirmationState, setConfirmationState] = React.useState<DocumentCatalogActionState>();
  const [saveUncertainError, setSaveUncertainError] = React.useState("");
  const saveButtonRef = React.useRef<HTMLButtonElement>(null);
  const [directState, action, pending] = React.useActionState(async (previous: DocumentCatalogActionState, form: FormData) => {
    onPendingChange?.(true);
    try {
      const result = await saveDocumentDefinition(scope, institutionId, initial?.id, previous, form, returnTo);
      if (result.success && result.document) {
        setChanges({});
        setRemovedAssignments({});
        onSaved?.(result.document);
        router.refresh();
      }
      return result;
    } finally {
      onPendingChange?.(false);
    }
  }, {});
  const state = confirmationState ?? directState;
  const [associations, setAssociations] = React.useState<PaginatedResponse<DocumentAssignment>>();
  const [page, setPage] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [associationsLoading, setAssociationsLoading] = React.useState(Boolean(initial && allowAssignments));
  const [impact, setImpact] = React.useState<{ paths: number; drafts: number }>();
  const [impactError, setImpactError] = React.useState("");
  const [readError, setReadError] = React.useState("");
  const assignmentInstitutionId = targetInstitutionId ?? institutionId;
  const [previousAssignmentInstitutionId, setPreviousAssignmentInstitutionId] = React.useState(assignmentInstitutionId);
  if (previousAssignmentInstitutionId !== assignmentInstitutionId) {
    setPreviousAssignmentInstitutionId(assignmentInstitutionId);
    setChanges({});
    setRemovedAssignments({});
    setAssociations(undefined);
    setAssociationsLoading(Boolean((state.document?.id ?? initial?.id) && allowAssignments && assignmentInstitutionId === institutionId));
    setPage(0);
    setReadError("");
  }

  const currentId = state.document?.id ?? initial?.id;
  const disabled = pending || state.uncertain === true || Boolean(saveUncertainError);
  const hasValidRequiredFields = Boolean(institutionId) && requiredDocumentFieldsSchema.safeParse({ name, allowedFormats }).success;
  const formRef = useActionFormErrorFocus(state, pending || Boolean(confirmationData));
  React.useEffect(() => {
    if (!institutionId || !currentId) {
      return;
    }
    const controller = new AbortController();
    void fetchDocumentCatalog<DocumentDefinition>(scope, institutionId, `/${currentId}`, controller.signal)
      .then((data) => {
        if (typeof data.affectedTrainingPaths !== "number" || typeof data.affectedDrafts !== "number") {
          throw new Error();
        }
        setImpact({ paths: data.affectedTrainingPaths, drafts: data.affectedDrafts });
        setImpactError("");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setImpactError("No se pudo confirmar el alcance. Recargá antes de guardar.");
        }
      });
    return () => controller.abort();
  }, [scope, institutionId, currentId, state.document]);
  React.useEffect(() => {
    if (!institutionId || !currentId || !allowAssignments || assignmentInstitutionId !== institutionId) {
      return;
    }
    const controller = new AbortController();
    void fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
      scope,
      institutionId,
      `/${currentId}/training-paths?page=${page}&size=${pageSize}&active=true`,
      controller.signal,
    )
      .then((data) => {
        setAssociations(data);
        setAssociationsLoading(false);

        setReadError("");
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setReadError("No se pudieron consultar los trayectos. Reintentá la consulta.");
          setAssociationsLoading(false);
        }
      });
    return () => controller.abort();
  }, [scope, institutionId, assignmentInstitutionId, currentId, page, pageSize, allowAssignments, state.document]);
  const selectPath = async (item: { id: string; name: string }): Promise<void> => {
    if (!assignmentInstitutionId) {
      return;
    }

    const removed = removedAssignments[item.id];
    if (removed) {
      setChanges((previous) => ({ ...previous, [item.id]: { ...removed, active: true } }));
      setRemovedAssignments((previous) => {
        const next = { ...previous };
        delete next[item.id];
        return next;
      });
      setReadError("");
      return;
    }

    let existing: DocumentAssignment | undefined;
    try {
      if (currentId && initial?.canChangeInstitution !== true && assignmentInstitutionId === institutionId && institutionId) {
        const data = await fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
          scope,
          institutionId,
          `/${currentId}/training-paths?trainingPathId=${item.id}&size=20`,
        );
        existing = data.items[0];
      }
      setChanges((previous) => {
        if (previous[item.id]) {
          return { ...previous, [item.id]: { ...previous[item.id], active: true } };
        }

        return {
          ...previous,
          [item.id]: existing
            ? { ...existing, active: true }
            : {
                trainingPathId: item.id,
                trainingPathName: item.name,
                level: "AT_SUBMISSION",
                displayOrder: 0,
                active: true,
                specificInstructions: null,
              },
        };
      });
      setReadError("");
    } catch {
      setReadError("No se pudo confirmar la asignación. Volvé a seleccionar el trayecto.");
    }
  };
  function removePath(item: DocumentAssignment): void {
    setRemovedAssignments((previous) => ({ ...previous, [item.trainingPathId]: item }));
    setChanges((previous) => {
      if (item.id) {
        return { ...previous, [item.trainingPathId]: { ...item, active: false } };
      }

      const next = { ...previous };
      delete next[item.trainingPathId];
      return next;
    });
  }

  const associated = assignmentInstitutionId === institutionId ? (associations?.items ?? []) : [];
  const totalPages = assignmentInstitutionId === institutionId ? (associations?.totalPages ?? 0) : 0;
  const totalItems = assignmentInstitutionId === institutionId ? (associations?.totalItems ?? 0) : 0;
  const rows = [...associated.filter((item) => !changes[item.trainingPathId]), ...Object.values(changes)].filter(
    (item) => !removedAssignments[item.trainingPathId] && item.active,
  );
  const isDialog = layout === "dialog";
  const Footer = isDialog ? DialogFooter : "div";
  const hasFieldErrors = Object.keys(state.fieldErrors ?? {}).length > 0;

  return (
    <ActionForm
      ref={formRef}
      action={action}
      noValidate
      className={cn("flex min-h-0 flex-col", !isDialog && "gap-4")}
      onSubmit={(event) => {
        if (currentId || isDialog) {
          event.preventDefault();
          if (!disabled && hasValidRequiredFields && (!currentId || (impact && !impactError))) {
            setConfirmationData(new FormData(event.currentTarget));
          }
        }
      }}
    >
      <input type="hidden" name="copySourceInstitutionId" value={copySourceInstitutionId ?? ""} />
      <input type="hidden" name="targetInstitutionId" value={scope === "admin" && currentId ? (targetInstitutionId ?? institutionId ?? "") : ""} />
      <input type="hidden" name="revision" value={state.document?.revision ?? initial?.revision ?? ""} />
      <input type="hidden" name="assignments" value={JSON.stringify(Object.values(changes))} />
      <div className={cn("space-y-4", isDialog && "-mx-4 min-h-0 overflow-y-auto px-4 pb-5")}>
        {(state.error && !hasFieldErrors) || impactError || saveUncertainError ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>No se pudo guardar</AlertTitle>
            <AlertDescription>{impactError || saveUncertainError || state.error}</AlertDescription>
          </Alert>
        ) : null}
        {state.success ? (
          <Alert variant="success" role="status">
            <AlertTitle>Documento guardado</AlertTitle>
            <AlertDescription>
              Trayectos afectados: {state.affectedTrainingPaths ?? 0}. Borradores sincronizados: {state.affectedDrafts ?? 0}.
            </AlertDescription>
          </Alert>
        ) : null}
        <section className={isDialog ? undefined : "bg-muted/25 rounded-xl border p-4 sm:p-6"}>
          {!isDialog ? (
            <header className="-mx-4 border-b px-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-5">
              <SectionHeader
                icon={FileTextIcon}
                title={initial ? "Editar documento compartido" : "Crear documento del catálogo"}
                description="El nombre, las instrucciones generales y los formatos se comparten entre trayectos. Las entregas siguen perteneciendo a cada inscripción."
              />
            </header>
          ) : null}
          <div className={isDialog ? "space-y-4" : "mt-5 space-y-5"}>
            {institutionField ? (
              <fieldset disabled={disabled || Boolean(confirmationData)} className="min-w-0">
                {institutionField}
              </fieldset>
            ) : null}
            <div className={cn("grid gap-4", isDialog ? "sm:grid-cols-[minmax(0,1fr)_10rem]" : "md:grid-cols-2")}>
              <FormField name="catalog-name" label="Nombre" error={state.fieldErrors?.name} required>
                <Input
                  id="catalog-name"
                  aria-invalid={Boolean(state.fieldErrors?.name)}
                  name="name"
                  value={name}
                  onChange={(event) => setName(event.currentTarget.value)}
                  maxLength={150}
                  required
                  disabled={disabled}
                  autoFocus={isDialog}
                />
              </FormField>
              <FormField name="catalog-active" label="Estado" error={state.fieldErrors?.active}>
                <FormSelect
                  name="active"
                  id="catalog-active"
                  defaultValue={String(initial?.active ?? defaults?.active ?? true)}
                  options={DOCUMENT_CATALOG_STATE_OPTIONS}
                  disabled={disabled}
                />
              </FormField>
            </div>
            <FormField name="catalog-file-types" label="Tipos de archivo admitidos" error={state.fieldErrors?.allowedFormats} required>
              {allowedFormats.map((format) => (
                <input key={format} type="hidden" name="allowedFormats" value={format} />
              ))}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    id="catalog-file-types"
                    aria-invalid={Boolean(state.fieldErrors?.allowedFormats)}
                    type="button"
                    size="lg"
                    variant="outline"
                    disabled={disabled}
                    className="w-full min-w-0 justify-between font-normal"
                  >
                    <span className={allowedFormats.length === 0 ? "text-muted-foreground truncate" : "truncate"}>
                      {allowedFormats.length > 0 ? formatDocumentFileCategories(allowedFormats) : "Seleccionar tipos"}
                    </span>
                    <ChevronDownIcon className="text-muted-foreground shrink-0" aria-hidden="true" />
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
                      disabled={disabled}
                    >
                      {category.label}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </FormField>
            <FormField name="catalog-instructions" label="Instrucciones generales" error={state.fieldErrors?.instructions}>
              <Textarea
                id="catalog-instructions"
                aria-invalid={Boolean(state.fieldErrors?.instructions)}
                name="instructions"
                defaultValue={initial?.instructions ?? defaults?.instructions ?? ""}
                rows={3}
                maxLength={1000}
                disabled={disabled}
              />
            </FormField>
          </div>
        </section>
        {allowAssignments ? (
          <section className="bg-muted/25 min-w-0 rounded-xl border p-4 sm:p-6" aria-label="Trayectos asociados" aria-busy={associationsLoading}>
            <header className="-mx-4 border-b px-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-5">
              <SectionHeader
                icon={GitBranchPlusIcon}
                title="Trayectos asignados"
                description="Agregá o quitá trayectos y configurá sus requisitos. Los cambios se aplican al guardar."
              />
            </header>
            <div className="mt-5 space-y-5">
              <FormField name="catalog-training-path" label="Agregar trayecto">
                <AsyncDropdown<{ id: string; name: string }>
                  key={`${scope}:${assignmentInstitutionId ?? ""}`}
                  id="catalog-training-path"
                  disabled={disabled || !assignmentInstitutionId}
                  closeOnSelect={false}
                  selectedValues={rows.filter((item) => item.active).map((item) => item.trainingPathId)}
                  placeholder="Buscar trayecto para agregar"
                  queryKey={["catalog-paths", scope, assignmentInstitutionId]}
                  fetchPage={(input) => {
                    if (!assignmentInstitutionId) {
                      return Promise.resolve({ items: [], nextPage: null });
                    }

                    return fetchAcademicOptionPage("training-paths", scope, assignmentInstitutionId, input);
                  }}
                  getItemValue={(item) => item.id}
                  getItemLabel={(item) => item.name}
                  onValueChange={(_, item) => {
                    if (!item) {
                      return;
                    }

                    const assignment = rows.find((row) => row.trainingPathId === item.id);
                    if (assignment?.active) {
                      removePath(assignment);
                      return;
                    }

                    void selectPath(item);
                  }}
                />
              </FormField>
              {readError ? (
                <Alert variant="destructive">
                  <CircleAlertIcon />
                  <AlertDescription>{readError}</AlertDescription>
                </Alert>
              ) : null}
            </div>
            {associationsLoading ? (
              <Skeleton className="mt-5 h-32" role="status" aria-label="Cargando asignaciones por trayecto" />
            ) : rows.length > 0 ? (
              <div className="mt-5 space-y-6">
                {rows.map((item) => (
                  <AssignmentFields
                    key={item.trainingPathId}
                    item={item}
                    disabled={disabled}
                    onChange={(value) => setChanges((previous) => ({ ...previous, [value.trainingPathId]: value }))}
                    onRemove={() => {
                      removePath(item);
                      document.getElementById("catalog-training-path")?.focus();
                    }}
                  />
                ))}
              </div>
            ) : !readError && page > 0 && associations?.items.length === 0 && totalItems > 0 ? (
              <DocumentCatalogAssignmentsEmptyState
                hasItemsOnOtherPages
                onFirstPage={() => {
                  setAssociationsLoading(true);
                  setPage(0);
                }}
              />
            ) : null}
            {currentId && totalPages > 1 ? (
              <div className="mt-5">
                <DataTablePagination
                  page={page}
                  size={pageSize}
                  totalPages={totalPages}
                  summaryLabel={`${totalItems} trayectos asociados.`}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  isPending={disabled || associationsLoading}
                  onPageChange={(value) => {
                    setAssociationsLoading(true);
                    setPage(value);
                  }}
                  onPageSizeChange={(value) => {
                    setAssociationsLoading(true);
                    setPageSize(Number(value));
                    setPage(0);
                  }}
                />
              </div>
            ) : null}
          </section>
        ) : null}
      </div>
      <Footer className={isDialog ? "mt-0 shrink-0" : "bg-background relative z-10 flex flex-wrap justify-end gap-3 pt-3 md:sticky md:bottom-0"}>
        <Button
          type="button"
          size="lg"
          variant="outline"
          className={isDialog ? "h-11 w-full shrink-0 sm:h-9 sm:w-auto" : "flex-1 sm:flex-none"}
          disabled={pending}
          onClick={() => {
            if (onCancel) {
              onCancel();
            } else if (returnTo) {
              router.push(returnTo);
            }
          }}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          ref={saveButtonRef}
          size="lg"
          className={isDialog ? "h-11 w-full shrink-0 sm:h-9 sm:w-auto" : "flex-1 sm:flex-none"}
          disabled={disabled || !hasValidRequiredFields || (Boolean(currentId) && (!impact || Boolean(impactError)))}
        >
          {pending ? "Guardando…" : "Guardar documento"}
        </Button>
      </Footer>
      {confirmationData && institutionId ? (
        <DocumentCatalogSaveConfirmation
          scope={scope}
          institutionId={institutionId}
          data={confirmationData}
          context={currentId && impact ? { id: currentId, impact } : undefined}
          returnTo={returnTo}
          onClose={() => setConfirmationData(undefined)}
          onPendingChange={onPendingChange}
          onUncertain={setSaveUncertainError}
          onResult={(result) => {
            setConfirmationState((previous) => ({ ...result, document: result.document ?? previous?.document ?? directState.document }));
          }}
          returnFocusRef={saveButtonRef}
          onSaved={(document) => {
            setConfirmationData(undefined);
            setChanges({});
            setRemovedAssignments({});
            onSaved?.(document);
          }}
        />
      ) : null}
    </ActionForm>
  );
}

function AssignmentFields({
  item,
  onChange,
  onRemove,
  disabled,
}: {
  item: DocumentAssignment;
  onChange: (item: DocumentAssignment) => void;
  onRemove: () => void;
  disabled: boolean;
}): React.ReactElement {
  return (
    <fieldset disabled={disabled} aria-labelledby={`assignment-title-${item.trainingPathId}`} className="min-w-0 space-y-4">
      <div className="bg-muted/70 -mx-4 flex items-center justify-between gap-3 border-y px-4 py-1.5 sm:-mx-6 sm:px-6">
        <h3 id={`assignment-title-${item.trainingPathId}`} className="min-w-0 py-0.5 text-sm font-semibold break-words">
          {item.trainingPathName ?? "Trayecto seleccionado"}
        </h3>
        <Button
          type="button"
          size="icon-lg"
          variant="destructive"
          className="shrink-0"
          aria-label={`Quitar ${item.trainingPathName ?? "trayecto"} de las asignaciones`}
          title="Quitar trayecto"
          onClick={onRemove}
        >
          <Trash2Icon className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem]">
        <FormField name={`level-${item.trainingPathId}`} label="Exigencia">
          <FormSelect
            name={`level-${item.trainingPathId}`}
            disabled={disabled}
            value={item.level}
            onValueChange={(value) => onChange({ ...item, level: value as DocumentAssignment["level"] })}
            options={Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => ({ value, label }))}
          />
        </FormField>
        <FormField name={`order-${item.trainingPathId}`} label="Orden" required>
          <Input
            id={`order-${item.trainingPathId}`}
            disabled={disabled}
            type="number"
            required
            min={0}
            max={2147483647}
            value={item.displayOrder}
            onChange={(event) => onChange({ ...item, displayOrder: event.currentTarget.valueAsNumber })}
          />
        </FormField>
      </div>
      <FormField name={`instructions-${item.trainingPathId}`} label="Instrucciones específicas">
        <Textarea
          id={`instructions-${item.trainingPathId}`}
          disabled={disabled}
          value={item.specificInstructions ?? ""}
          maxLength={1000}
          onChange={(event) => onChange({ ...item, specificInstructions: event.currentTarget.value })}
        />
      </FormField>
    </fieldset>
  );
}
