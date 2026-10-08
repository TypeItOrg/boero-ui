"use client";

import { useActionState, type ReactElement, type RefObject } from "react";

import { useRouter } from "next/navigation";

import { CircleAlertIcon, FileTextIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@common/components/ui/alert-dialog";
import { Button } from "@common/components/ui/button";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { saveDocumentDefinition } from "@features/document-catalog/actions/save-document-definition.action";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";

const CONFIRMATION_TEXT_CLASS_NAME = "text-muted-foreground mx-auto w-full max-w-sm text-center text-sm leading-relaxed text-pretty";

export function DocumentCatalogSaveConfirmation({
  scope,
  institutionId,
  data,
  onClose,
  onSaved,
  onPendingChange,
  onUncertain,
  returnFocusRef,
  context,
  returnTo,
  onResult,
}: {
  scope: AcademicScope;
  institutionId: string;
  data: FormData;
  onClose: () => void;
  onSaved: (document: DocumentDefinition) => void;
  onPendingChange?: (pending: boolean) => void;
  onUncertain: (error: string) => void;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  context?: { id: string; impact: { paths: number; drafts: number } };
  returnTo?: string;
  onResult: (result: DocumentCatalogActionState) => void;
}): ReactElement {
  const router = useRouter();
  const [state, action, pending] = useActionState(async (previous: DocumentCatalogActionState) => {
    onPendingChange?.(true);

    try {
      const result = await saveDocumentDefinition(scope, institutionId, context?.id, previous, data, returnTo);

      onResult(result);

      if (result.uncertain) {
        onUncertain(result.error ?? "No se pudo confirmar el guardado. Recargá el catálogo antes de reintentar.");
      }

      if (result.success && result.document) {
        onSaved(result.document);
        router.refresh();
      }

      return result;
    } finally {
      onPendingChange?.(false);
    }
  }, {});
  const errors = [state.error, ...Object.values(state.fieldErrors ?? {})].filter(Boolean);

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !pending) {
          onClose();
        }
      }}
    >
      <AlertDialogContent
        asChild
        className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-md"
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          returnFocusRef.current?.focus();
        }}
      >
        <ActionForm action={action} onSubmit={(event) => event.stopPropagation()}>
          <AlertDialogHeader>
            <div className="bg-primary/10 text-primary mb-1 flex size-12 items-center justify-center rounded-2xl">
              <FileTextIcon className="size-6" aria-hidden="true" />
            </div>
            <AlertDialogTitle>{context ? "¿Guardar cambios en el documento?" : "¿Crear documento en el catálogo?"}</AlertDialogTitle>
            <AlertDialogDescription className={CONFIRMATION_TEXT_CLASS_NAME}>
              {context
                ? "Este documento es compartido. Los cambios se aplican a los borradores; las inscripciones enviadas conservan sus condiciones originales."
                : "Quedará guardado aunque después canceles el formulario del trayecto."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {context && data.get("targetInstitutionId") && data.get("targetInstitutionId") !== institutionId ? (
            <p className={CONFIRMATION_TEXT_CLASS_NAME}>
              También se cambiará la institución del documento. Esto solo se permite si nunca fue utilizado.
            </p>
          ) : null}

          {context && data.get("active") === "false" ? (
            <p className={CONFIRMATION_TEXT_CLASS_NAME}>
              Al desactivar el documento, se retiran sus requisitos de los borradores, pero se conservan los archivos y el historial.
            </p>
          ) : null}

          {errors.length > 0 ? (
            <Alert variant="destructive" role="alert">
              <CircleAlertIcon />
              <AlertDescription>{errors.join(" ")}</AlertDescription>
            </Alert>
          ) : null}

          <AlertDialogFooter>
            <AlertDialogCancel size="lg" disabled={pending}>
              Volver al formulario
            </AlertDialogCancel>
            <Button type="submit" size="lg" disabled={pending || state.uncertain === true}>
              {pending ? "Guardando…" : context ? "Guardar cambios" : "Crear documento"}
            </Button>
          </AlertDialogFooter>
        </ActionForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
