"use client";

import { useActionState, useCallback, useState, type ReactElement } from "react";

import { usePathname, useSearchParams } from "next/navigation";

import { PlusIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { DialogFooter } from "@common/components/ui/dialog";
import { Textarea } from "@common/components/ui/textarea";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { TrainingPathCatalogDocumentCard } from "@features/academic/components/training-path-catalog-document-card";
import { TrainingPathRequirementAssignmentFields } from "@features/academic/components/training-path-requirement-assignment-fields";
import type { TrainingPathRequirementFormProps } from "@features/academic/types/training-path-requirement-form-props.types";
import { DocumentCatalogForm } from "@features/document-catalog/components/document-catalog-form";
import { DocumentDefinitionPicker } from "@features/document-catalog/components/document-definition-picker";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { DOCUMENT_LEVEL_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import { documentRequirementFormSchema } from "@features/enrollment-applications/schemas/document-requirement.schema";

export function RequirementForm({
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
}: TrainingPathRequirementFormProps): ReactElement {
  const pathname = usePathname();

  const searchParams = useSearchParams();

  const [document, setDocument] = useState<DocumentDefinition | undefined>(
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

  const selectDocument = useCallback(
    (value: DocumentDefinition) => {
      setDocument(value);
      onCreatingChange(false);
    },
    [onCreatingChange],
  );

  const [state, action, pending] = useActionState(async (_previous: { error?: string }, form: FormData): Promise<{ error?: string }> => {
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
      return {
        error: "Este documento ya está configurado. Cerrá este diálogo y reactivá o editá su requisito existente.",
      };
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
          <TrainingPathCatalogDocumentCard
            document={document}
            canManageCatalog={canManageCatalog}
            scope={scope}
            institutionId={institutionId}
            pathname={pathname}
            searchParams={searchParams}
          />
        ) : null}
        <FormField name="level" label="Exigencia">
          <FormSelect
            name="level"
            defaultValue={initial?.level ?? "AT_SUBMISSION"}
            options={Object.entries(DOCUMENT_LEVEL_LABELS).map(([value, label]) => ({
              value,
              label,
            }))}
            disabled={pending}
          />
        </FormField>
        <TrainingPathRequirementAssignmentFields initial={initial} pending={pending} />
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
