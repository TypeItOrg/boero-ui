"use client";

import * as React from "react";

import { CircleAlertIcon, FilePlus2Icon, FileTextIcon, Trash2Icon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@common/components/ui/dialog";
import { Textarea } from "@common/components/ui/textarea";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentDefinitionPicker } from "@features/document-catalog/components/document-definition-picker";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { requestDocuments } from "@features/enrollment-applications/actions/request-documents.action";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { DocumentRequestActionState } from "@features/enrollment-applications/types/document-request-action-state.types";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

export function RequestDocumentsDialog({
  application,
  scope,
  onClose,
  onSaved,
  onUncertain,
}: {
  application: EnrollmentApplicationResponse;
  scope: AcademicScope;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onUncertain: () => void;
}): React.ReactElement {
  const [selected, setSelected] = React.useState<Array<{ document: DocumentDefinition; level: DocumentRequirement["level"] }>>([]);
  const [selectionError, setSelectionError] = React.useState("");
  const [state, action, pending] = React.useActionState(async (previous: DocumentRequestActionState, form: FormData) => {
    const result = await requestDocuments(scope, application.institutionId, application.applicationId, previous, form);
    if (result.uncertain) {
      onUncertain();
    }
    if (result.success) {
      try {
        await onSaved();
        onClose();
      } catch {
        onUncertain();
        return { error: ENROLLMENT_MESSAGES.requestSavedRefreshFailed, uncertain: true };
      }
    }
    return result;
  }, {});

  const formRef = useActionFormErrorFocus(state, pending);

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
        className="flex max-h-[calc(100dvh-2rem)] flex-col gap-5 overflow-hidden sm:max-w-xl"
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
      >
        <DialogHeader className="shrink-0 items-center pt-2 text-center">
          <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
            <FilePlus2Icon className="size-6" aria-hidden="true" />
          </div>
          <DialogTitle className="leading-snug font-semibold">Solicitar documentación</DialogTitle>
          <DialogDescription className="max-w-md leading-relaxed text-pretty">
            El pedido no cambia el estado de la inscripción ni sus matrículas. Las condiciones se copian al confirmar el pedido.
          </DialogDescription>
        </DialogHeader>
        <ActionForm ref={formRef} action={action} className="flex min-h-0 flex-col">
          <div className="-mx-4 min-h-0 space-y-5 overflow-y-auto px-4 pb-5">
            <input
              type="hidden"
              name="documents"
              value={JSON.stringify(selected.map((item) => ({ documentId: item.document.id, level: item.level })))}
            />
            {state.error || selectionError ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertTitle>Revisá el pedido</AlertTitle>
                <AlertDescription>{state.error ?? selectionError}</AlertDescription>
              </Alert>
            ) : null}
            <FormField name="document-request-reason" label="Motivo del pedido" required>
              <Textarea id="document-request-reason" name="reason" required maxLength={2000} rows={3} disabled={pending || state.uncertain} />
            </FormField>
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
                            <TrainingPathDocumentInstructions
                              name={item.document.name}
                              instructions={item.document.instructions}
                              className="size-6"
                            />
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
          </div>
          <DialogFooter className="shrink-0">
            <Button type="button" size="lg" variant="outline" disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="lg" disabled={pending || state.uncertain || selected.length === 0}>
              {pending ? "Solicitando…" : "Confirmar pedido"}
            </Button>
          </DialogFooter>
        </ActionForm>
      </DialogContent>
    </Dialog>
  );
}
