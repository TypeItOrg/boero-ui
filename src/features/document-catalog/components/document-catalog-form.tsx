"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { ChevronDownIcon, CircleAlertIcon, FileTextIcon, GitBranchPlusIcon, InfoIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { SectionHeader } from "@common/components/section-header";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { Checkbox } from "@common/components/ui/checkbox";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Field, FieldContent, FieldLabel } from "@common/components/ui/field";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";
import { Input } from "@common/components/ui/input";
import { Skeleton } from "@common/components/ui/skeleton";
import { Textarea } from "@common/components/ui/textarea";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { PAGE_SIZE_OPTIONS } from "@common/utils/pagination-query.util";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { saveDocumentDefinition } from "@features/document-catalog/actions/save-document-definition.action";
import { DOCUMENT_CATALOG_STATE_OPTIONS, DOCUMENT_ASSIGNMENT_STATE_OPTIONS } from "@features/document-catalog/constants/document-catalog.constants";
import { fetchDocumentCatalog } from "@features/document-catalog/services/document-catalog-client.service";
import type { DocumentAssignment } from "@features/document-catalog/types/document-assignment.types";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { DOCUMENT_FILE_CATEGORIES, DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function DocumentCatalogForm({
  scope,
  institutionId,
  institutionField,
  initial,
  onSaved,
  onCancel,
  onPendingChange,
  allowAssignments = true,
}: {
  scope: AcademicScope;
  institutionId: string;
  institutionField?: React.ReactNode;
  initial?: DocumentDefinition;
  onSaved?: (document: DocumentDefinition) => void;
  onCancel: () => void;
  onPendingChange?: (pending: boolean) => void;
  allowAssignments?: boolean;
}): React.ReactElement {
  const router = useRouter();
  const [allowedFormats, setAllowedFormats] = React.useState<string[]>(
    () => initial?.allowedFormats ?? DOCUMENT_FILE_CATEGORIES.flatMap((category) => [...category.formats]),
  );
  const [changes, setChanges] = React.useState<Record<string, DocumentAssignment>>({});
  const [state, action, pending] = React.useActionState(async (previous: DocumentCatalogActionState, form: FormData) => {
    onPendingChange?.(true);
    try {
      const result = await saveDocumentDefinition(scope, institutionId, initial?.id, previous, form);
      if (result.success && result.document) {
        setChanges({});
        onSaved?.(result.document);
        router.refresh();
      }
      return result;
    } finally {
      onPendingChange?.(false);
    }
  }, {});
  const [associated, setAssociated] = React.useState<DocumentAssignment[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalPages, setTotalPages] = React.useState(0);
  const [totalItems, setTotalItems] = React.useState(0);
  const [pageSize, setPageSize] = React.useState(20);
  const [confirmed, setConfirmed] = React.useState(false);
  const [associationsLoading, setAssociationsLoading] = React.useState(Boolean(initial && allowAssignments));
  const [impact, setImpact] = React.useState<{ paths: number; drafts: number }>();
  const [impactError, setImpactError] = React.useState("");
  const [readError, setReadError] = React.useState("");
  const currentId = state.document?.id ?? initial?.id;
  const disabled = pending || state.uncertain === true;
  const formRef = useActionFormErrorFocus(state, pending);
  React.useEffect(() => {
    if (!currentId) {
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
  }, [scope, institutionId, currentId, state.document?.revision]);
  React.useEffect(() => {
    if (!currentId || !allowAssignments) {
      return;
    }
    const controller = new AbortController();
    void fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
      scope,
      institutionId,
      `/${currentId}/training-paths?page=${page}&size=${pageSize}`,
      controller.signal,
    )
      .then((data) => {
        setAssociated(data.items);
        setTotalPages(data.totalPages);
        setTotalItems(data.totalItems);
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
  }, [scope, institutionId, currentId, page, pageSize, allowAssignments, state.document?.revision]);
  const selectPath = async (item: { id: string; name: string }): Promise<void> => {
    let existing: DocumentAssignment | undefined;
    try {
      if (currentId) {
        const data = await fetchDocumentCatalog<PaginatedResponse<DocumentAssignment>>(
          scope,
          institutionId,
          `/${currentId}/training-paths?trainingPathId=${item.id}&size=20`,
        );
        existing = data.items[0];
      }
      setChanges((previous) => ({
        ...previous,
        [item.id]: existing ?? {
          trainingPathId: item.id,
          trainingPathName: item.name,
          level: "AT_SUBMISSION",
          displayOrder: 0,
          active: true,
          specificInstructions: null,
        },
      }));
      setReadError("");
    } catch {
      setReadError("No se pudo confirmar la asignación. Volvé a seleccionar el trayecto.");
    }
  };
  const rows = [...associated.filter((item) => !changes[item.trainingPathId]), ...Object.values(changes)];
  return (
    <ActionForm ref={formRef} action={action} className="flex min-h-0 flex-col gap-4">
      <input type="hidden" name="revision" value={state.document?.revision ?? initial?.revision ?? ""} />
      <input type="hidden" name="assignments" value={JSON.stringify(Object.values(changes))} />
      {state.error || impactError ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo guardar</AlertTitle>
          <AlertDescription>{state.error || impactError}</AlertDescription>
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
      <section className="bg-muted/25 rounded-xl border p-4 sm:p-6">
        <header className="-mx-4 border-b px-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-5">
          <SectionHeader
            icon={FileTextIcon}
            title={initial ? "Editar documento compartido" : "Crear documento del catálogo"}
            description="El nombre, las instrucciones generales y los formatos se comparten entre trayectos. Las entregas siguen perteneciendo a cada inscripción."
          />
        </header>
        <div className="mt-5 space-y-5">
          {institutionField ? (
            <fieldset disabled={disabled} className="min-w-0">
              {institutionField}
            </fieldset>
          ) : null}
          <div className="grid gap-4 md:grid-cols-2">
            <FormField name="catalog-name" label="Nombre" required>
              <Input id="catalog-name" name="name" defaultValue={initial?.name ?? ""} maxLength={150} required disabled={disabled} />
            </FormField>
            <FormField name="catalog-active" label="Estado">
              <FormSelect
                name="active"
                id="catalog-active"
                defaultValue={String(initial?.active ?? true)}
                options={DOCUMENT_CATALOG_STATE_OPTIONS}
                disabled={disabled}
              />
            </FormField>
          </div>
          <FormField name="catalog-instructions" label="Instrucciones generales">
            <Textarea
              id="catalog-instructions"
              name="instructions"
              defaultValue={initial?.instructions ?? ""}
              rows={3}
              maxLength={1000}
              disabled={disabled}
            />
          </FormField>
          <FormField name="catalog-file-types" label="Tipos de archivo admitidos" required>
            {allowedFormats.map((format) => (
              <input key={format} type="hidden" name="allowedFormats" value={format} />
            ))}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  id="catalog-file-types"
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
        </div>
      </section>
      {allowAssignments ? (
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-6" aria-label="Trayectos asociados">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-6 sm:px-6 sm:pb-5">
            <SectionHeader
              icon={GitBranchPlusIcon}
              title="Asignaciones por trayecto"
              description="Solo se guardan las asignaciones que modificás. Para quitar una, seleccioná Inactiva; no se borra su historial."
            />
          </header>
          <div className="mt-5 space-y-5">
            <FormField name="catalog-training-path" label="Seleccionar trayecto">
              <AsyncDropdown<{ id: string; name: string }>
                id="catalog-training-path"
                disabled={disabled}
                placeholder="Buscar trayecto para asignar"
                queryKey={["catalog-paths", scope, institutionId]}
                fetchPage={(input) => fetchAcademicOptionPage("training-paths", scope, institutionId, input)}
                getItemValue={(item) => item.id}
                getItemLabel={(item) => item.name}
                onValueChange={(_, item) => {
                  if (item) {
                    void selectPath(item);
                  }
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
            <Skeleton className="mt-5 h-32" />
          ) : rows.length > 0 ? (
            <div className="mt-5 space-y-6">
              {rows.map((item) => (
                <AssignmentFields
                  key={item.trainingPathId}
                  item={item}
                  disabled={disabled}
                  onChange={(value) => setChanges((previous) => ({ ...previous, [value.trainingPathId]: value }))}
                />
              ))}
            </div>
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
      {currentId ? (
        <Alert>
          <InfoIcon />
          <AlertTitle>Alcance del cambio compartido</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              Esta edición modifica una definición compartida. Los borradores adoptarán las nuevas condiciones; las inscripciones enviadas conservarán
              las originales.
            </p>
            <p>
              Desactivar el documento retira sus requisitos de los borradores y conserva archivos e historial. Trayectos asociados:{" "}
              {impact?.paths ?? "Consultando"}. Borradores vinculados: {impact?.drafts ?? "Consultando"}.
            </p>
            <Field orientation="horizontal">
              <Checkbox
                id="catalog-confirm-shared"
                name="confirmSharedChange"
                checked={confirmed}
                onCheckedChange={(value) => setConfirmed(value === true)}
                disabled={disabled}
              />
              <FieldContent>
                <FieldLabel htmlFor="catalog-confirm-shared" className="font-normal">
                  Entiendo el alcance de estos cambios.
                </FieldLabel>
              </FieldContent>
            </Field>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <InfoIcon />
          <AlertDescription>
            El documento se crea en el catálogo. Cancelar posteriormente el formulario de un trayecto no lo elimina.
          </AlertDescription>
        </Alert>
      )}
      <div className="bg-background sticky bottom-0 z-10 flex flex-wrap justify-end gap-3 py-4">
        <Button type="button" size="lg" variant="outline" className="flex-1 sm:flex-none" disabled={pending} onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={disabled || (Boolean(currentId) && (!confirmed || !impact || Boolean(impactError)))}
        >
          {pending ? "Guardando…" : "Guardar documento"}
        </Button>
      </div>
    </ActionForm>
  );
}

function AssignmentFields({
  item,
  onChange,
  disabled,
}: {
  item: DocumentAssignment;
  onChange: (item: DocumentAssignment) => void;
  disabled: boolean;
}): React.ReactElement {
  return (
    <fieldset disabled={disabled} aria-labelledby={`assignment-title-${item.trainingPathId}`} className="min-w-0 space-y-4">
      <h3
        id={`assignment-title-${item.trainingPathId}`}
        className="bg-muted/70 -mx-4 border-y px-4 py-2 text-sm font-semibold break-words sm:-mx-6 sm:px-6"
      >
        {item.trainingPathName ?? "Trayecto seleccionado"}
      </h3>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_8rem] lg:grid-cols-[minmax(0,1fr)_8rem_11rem]">
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
        <FormField name={`active-${item.trainingPathId}`} label="Asignación" className="sm:col-span-2 lg:col-span-1">
          <FormSelect
            name={`active-${item.trainingPathId}`}
            disabled={disabled}
            value={String(item.active)}
            onValueChange={(value) => onChange({ ...item, active: value === "true" })}
            options={DOCUMENT_ASSIGNMENT_STATE_OPTIONS}
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
