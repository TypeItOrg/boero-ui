"use client";

import { useActionState, useState, type ReactElement } from "react";

import { CircleAlertIcon, FilePlus2Icon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@common/components/ui/dialog";
import { Textarea } from "@common/components/ui/textarea";
import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";

import { FormField } from "@features/academic/components/academic-form-controls";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
import { requestDocuments } from "@features/enrollment-applications/actions/request-documents.action";
import { RequestedDocumentFields } from "@features/enrollment-applications/components/requested-document-fields";
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
}): ReactElement {
  const [selected, setSelected] = useState<Array<{ document: DocumentDefinition; level: DocumentRequirement["level"] }>>([]);
  const [selectionError, setSelectionError] = useState("");
  const [state, action, pending] = useActionState(async (previous: DocumentRequestActionState, form: FormData) => {
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
            <RequestedDocumentFields
              scope={scope}
              application={application}
              pending={pending}
              state={state}
              selected={selected}
              setSelectionError={setSelectionError}
              setSelected={setSelected}
            />
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
