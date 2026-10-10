"use client";

import { useActionState, type ReactElement } from "react";

import { ArchiveIcon, CircleAlertIcon, FileTextIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";
import { Textarea } from "@common/components/ui/textarea";

import { FormField } from "@features/academic/components/academic-form-controls";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { mutateDocument } from "@features/enrollment-applications/actions/documentation.actions";
import { DocumentFilePreview } from "@features/enrollment-applications/components/document-file-preview";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";

export function DocumentMutation({
  applicationId,
  scope,
  requirement,
  operation,
  onClose,
  onSaved,
}: {
  applicationId: string;
  scope: AcademicScope;
  requirement: DocumentRequirement;
  operation: "review" | "withdraw";
  onClose: () => void;
  onSaved: () => Promise<void>;
}): ReactElement {
  const withdrawing = operation === "withdraw";

  const attachment = requirement.currentAttachment;

  const title = withdrawing ? "Retirar entrega" : "Revisar documento";

  const MutationIcon = withdrawing ? ArchiveIcon : FileTextIcon;

  const [state, action, pending] = useActionState(async (previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
    try {
      const result = await mutateDocument(scope, applicationId, operation, attachment!.id, previous, form);

      if (result.success) {
        await onSaved();
        onClose();
      }

      return result;
    } catch {
      return { error: DOCUMENT_MESSAGES.failed };
    }
  }, {});

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent asChild className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md">
        <form action={action}>
          <AlertDialogHeader>
            <div
              className={`mb-1 flex size-12 items-center justify-center rounded-2xl ${
                withdrawing ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
              }`}
            >
              <MutationIcon className="size-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle>{withdrawing ? "¿Retirar esta entrega?" : title}</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              {withdrawing
                ? "El documento dejará de contar como entrega vigente. El archivo seguirá disponible en el historial y podrás adjuntar otro."
                : "Indicá si el documento cumple con lo solicitado o necesita una corrección."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted/40 flex min-w-0 gap-3 rounded-lg border p-3 text-sm">
            {attachment ? (
              <div className="relative w-14 shrink-0 self-stretch">
                <DocumentFilePreview
                  key={attachment.id}
                  src={getAttachmentDownloadUrl(applicationId, attachment.id, scope)}
                  name={attachment.originalFileName}
                  contentType={attachment.contentType}
                  compact
                  className="absolute inset-0 m-0 h-full w-full"
                />
              </div>
            ) : null}
            <div className="flex min-h-14 min-w-0 flex-1 flex-col justify-center gap-1">
              <p className="font-medium break-words">{requirement.name}</p>
              <p className="text-muted-foreground text-xs break-all">{attachment?.originalFileName}</p>
            </div>
            {attachment ? (
              <div className="flex shrink-0 items-center">
                <DocumentFilePreview
                  src={getAttachmentDownloadUrl(applicationId, attachment.id, scope)}
                  name={attachment.originalFileName}
                  contentType={attachment.contentType}
                  iconOnly
                />
              </div>
            ) : null}
          </div>
          {operation === "review" ? (
            <FormField name={`document-observation-${requirement.id}`} label="Observación" required>
              <Textarea
                id={`document-observation-${requirement.id}`}
                name="observation"
                placeholder="Indicá qué debe corregir el aspirante"
                maxLength={2000}
                required
                aria-describedby={`document-observation-help-${requirement.id}`}
                disabled={pending}
              />
              <p id={`document-observation-help-${requirement.id}`} className="text-muted-foreground text-xs">
                Obligatoria para observar el documento. Para aceptarlo, podés dejarla vacía.
              </p>
            </FormField>
          ) : null}
          {state.error ? (
            <Alert variant="destructive">
              <CircleAlertIcon />
              <AlertTitle>No se pudo guardar</AlertTitle>
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          ) : null}
          <AlertDialogFooter>
            <Button size="lg" type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
            {operation === "review" ? (
              <>
                <Button size="lg" type="submit" name="status" value="OBSERVED" variant="outline" disabled={pending}>
                  Observar
                </Button>
                <Button size="lg" type="submit" name="status" value="ACCEPTED" formNoValidate disabled={pending}>
                  Aceptar documento
                </Button>
              </>
            ) : (
              <Button size="lg" type="submit" disabled={pending} variant="destructive">
                {pending ? "Retirando…" : title}
              </Button>
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
