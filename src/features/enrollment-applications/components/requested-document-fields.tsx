"use client";

import type { Dispatch, ReactElement, SetStateAction } from "react";

import { FileTextIcon, Trash2Icon } from "lucide-react";

import { Button } from "@common/components/ui/button";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentDefinitionPicker } from "@features/document-catalog/components/document-definition-picker";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import type { DocumentRequestActionState } from "@features/enrollment-applications/types/document-request-action-state.types";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function RequestedDocumentFields({
  scope,
  application,
  pending,
  state,
  selected,
  setSelectionError,
  setSelected,
}: {
  scope: AcademicScope;
  application: EnrollmentApplicationResponse;
  pending: boolean;
  state: DocumentRequestActionState;
  selected: { document: DocumentDefinition; level: DocumentRequirement["level"] }[];
  setSelectionError: Dispatch<SetStateAction<string>>;
  setSelected: Dispatch<SetStateAction<{ document: DocumentDefinition; level: DocumentRequirement["level"] }[]>>;
}): ReactElement {
  return (
    <section className="bg-muted/25 overflow-hidden rounded-xl border" aria-label="Documentos del pedido">
      <div className="space-y-2 p-4">
        <DocumentDefinitionPicker
          scope={scope}
          institutionId={application.institutionId}
          applicationId={application.applicationId}
          disabled={pending || state.uncertain}
          selectedValues={selected.map((item) => item.document.id)}
          onSelect={(document) => {
            if (application.documents?.some((item) => item.documentId === document.id)) {
              setSelectionError("Este documento ya se solicita en la inscripción. Consultá su requisito existente.");

              return;
            }

            setSelected((previous) =>
              previous.some((item) => item.document.id === document.id)
                ? previous.filter((item) => item.document.id !== document.id)
                : [...previous, { document, level: "AT_SUBMISSION" }],
            );
            setSelectionError("");
          }}
        />
      </div>
      {selected.length ? (
        <div className="bg-background/60 divide-y border-t">
          {selected.map((item) => (
            <fieldset key={item.document.id} disabled={pending || state.uncertain} className="min-w-0 space-y-4 p-4">
              <legend className="sr-only">{item.document.name}</legend>
              <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <div className="bg-primary/10 text-primary flex w-11 items-center justify-center self-stretch rounded-xl">
                  <FileTextIcon className="size-5" aria-hidden="true" />
                </div>
                <div className="flex min-h-11 min-w-0 flex-col justify-center gap-0.5">
                  <div className="flex min-w-0 items-center gap-1">
                    <h3 className="min-w-0 text-sm leading-snug font-semibold break-words">{item.document.name}</h3>
                    <TrainingPathDocumentInstructions name={item.document.name} instructions={item.document.instructions} className="size-6" />
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed break-words">
                    {formatDocumentFileCategories(item.document.allowedFormats)}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon-lg"
                  variant="destructive"
                  disabled={pending || state.uncertain}
                  aria-label={`Quitar ${item.document.name}`}
                  title="Quitar documento"
                  onClick={() => {
                    setSelected((previous) => previous.filter((current) => current.document.id !== item.document.id));
                    setSelectionError("");
                  }}
                >
                  <Trash2Icon aria-hidden="true" />
                </Button>
              </div>
              <FormField name={`request-level-${item.document.id}`} label="Exigencia">
                <FormSelect
                  name={`request-level-${item.document.id}`}
                  value={item.level}
                  disabled={pending || state.uncertain}
                  onValueChange={(value) =>
                    setSelected((previous) =>
                      previous.map((current) =>
                        current.document.id === item.document.id ? { ...current, level: value as typeof item.level } : current,
                      ),
                    )
                  }
                  options={[
                    { value: "AT_SUBMISSION", label: "Obligatorio antes de aprobar" },
                    { value: "BEFORE_CONFIRMATION", label: "Obligatorio para confirmar" },
                    { value: "OPTIONAL", label: "Opcional" },
                  ]}
                />
              </FormField>
            </fieldset>
          ))}
        </div>
      ) : null}
    </section>
  );
}
