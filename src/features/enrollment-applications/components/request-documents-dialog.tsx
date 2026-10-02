"use client";

import * as React from "react";

import { CircleAlertIcon, XIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@common/components/ui/dialog";
import { Textarea } from "@common/components/ui/textarea";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";

import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentDefinitionPicker } from "@features/document-catalog/components/document-definition-picker";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { requestDocuments } from "@features/enrollment-applications/actions/request-documents.action";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import type { DocumentRequestActionState } from "@features/enrollment-applications/types/document-request-action-state.types";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

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
        className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
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
        <DialogHeader>
          <DialogTitle>Solicitar documentación</DialogTitle>
          <DialogDescription>
            El pedido no cambia el estado de la inscripción ni sus matrículas. Las condiciones se copian al confirmar el pedido.
          </DialogDescription>
        </DialogHeader>
        <ActionForm ref={formRef} action={action} className="space-y-4">
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
          <DocumentDefinitionPicker
            scope={scope}
            institutionId={application.institutionId}
            applicationId={application.applicationId}
            disabled={pending || state.uncertain}
            onSelect={(document) => {
              if (
                selected.some((item) => item.document.id === document.id) ||
                application.documents?.some((item) => item.documentId === document.id)
              ) {
                setSelectionError("Este documento ya está seleccionado o requerido. Consultá su requisito existente.");
                return;
              }
              setSelected((previous) => [...previous, { document, level: "AT_SUBMISSION" }]);
              setSelectionError("");
            }}
          />
          {selected.length ? (
            <div className="space-y-4">
              {selected.map((item) => (
                <fieldset
                  key={item.document.id}
                  disabled={pending || state.uncertain}
                  className="bg-muted/25 min-w-0 space-y-4 rounded-lg border p-4"
                >
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <p className="min-w-0 font-medium break-words">{item.document.name}</p>
                    <Button
                      type="button"
                      size="icon-lg"
                      variant="ghost"
                      disabled={pending || state.uncertain}
                      aria-label={`Quitar ${item.document.name}`}
                      onClick={() => setSelected((previous) => previous.filter((current) => current.document.id !== item.document.id))}
                    >
                      <XIcon />
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
                  {item.document.instructions ? (
                    <p className="text-muted-foreground text-sm break-words whitespace-pre-wrap">{item.document.instructions}</p>
                  ) : null}
                </fieldset>
              ))}
            </div>
          ) : null}
          <DialogFooter className="mt-6">
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
