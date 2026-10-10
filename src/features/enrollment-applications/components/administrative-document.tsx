"use client";

import { useRef, useState, type ReactElement } from "react";

import { FileTextIcon, HistoryIcon, MoreHorizontalIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentSavedFile } from "@features/enrollment-applications/components/document-saved-file";
import { DocumentUpload } from "@features/enrollment-applications/components/document-upload";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";

export function AdministrativeDocument({
  applicationId,
  scope,
  requirement,
  disabled,
  showDeliveryHistory,
  showRequirementChanges,
  onSaved,
  onReview,
  onWithdraw,
  onActivity,
}: {
  applicationId: string;
  scope: AcademicScope;
  requirement: DocumentRequirement;
  disabled: boolean;
  showDeliveryHistory: boolean;
  showRequirementChanges: boolean;
  onSaved: () => Promise<void>;
  onReview: () => void;
  onWithdraw: () => void;
  onActivity: (tab: "deliveries" | "changes", trigger: HTMLButtonElement | null) => void;
}): ReactElement {
  const [assistedUpload, setAssistedUpload] = useState(false);

  const menuTriggerRef = useRef<HTMLButtonElement>(null);

  const attachment = requirement.currentAttachment;

  const canUpload = requirement.canUpload || requirement.canReplace;

  const hasChanges = showRequirementChanges && Boolean(requirement.changes?.length);

  const actionsDisabled = disabled || assistedUpload;

  const secondaryActions = (
    <>
      {showDeliveryHistory ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-lg"
          className="size-11"
          aria-label={`Ver historial de ${requirement.name}`}
          title="Ver historial"
          aria-haspopup="dialog"
          onClick={(event) => onActivity("deliveries", event.currentTarget)}
        >
          <HistoryIcon aria-hidden="true" />
        </Button>
      ) : null}
      {canUpload || requirement.canWithdraw || hasChanges ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              ref={menuTriggerRef}
              type="button"
              variant="ghost"
              size="icon-lg"
              className="size-11"
              aria-label={`Más acciones para ${requirement.name}`}
              title="Más acciones"
            >
              <MoreHorizontalIcon aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-max max-w-[calc(100vw-2rem)] min-w-48 p-1.5">
            {canUpload ? (
              <DropdownMenuItem className="px-2.5 py-1.5 whitespace-normal" disabled={actionsDisabled} onSelect={() => setAssistedUpload(true)}>
                {attachment ? "Reemplazar entrega" : "Adjuntar documentación"}
              </DropdownMenuItem>
            ) : null}
            {requirement.canWithdraw ? (
              <DropdownMenuItem className="px-2.5 py-1.5" variant="destructive" disabled={actionsDisabled} onSelect={onWithdraw}>
                Retirar entrega
              </DropdownMenuItem>
            ) : null}
            {hasChanges ? (
              <DropdownMenuItem className="px-2.5 py-1.5 whitespace-normal" onSelect={() => onActivity("changes", menuTriggerRef.current)}>
                Ver cambios del requisito
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </>
  );

  return (
    <div className="space-y-4">
      {attachment ? (
        <DocumentSavedFile
          file={attachment}
          applicationId={applicationId}
          scope={scope}
          secondaryActions={secondaryActions}
          primaryAction={
            requirement.canReview ? (
              <Button
                type="button"
                size="lg"
                className="h-11 w-full @xl/file-selection:h-9 @xl/file-selection:w-auto"
                disabled={actionsDisabled}
                onClick={onReview}
              >
                Revisar documento
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="bg-muted/50 grid min-w-0 grid-cols-[3rem_minmax(0,1fr)] items-center gap-3 rounded-lg p-3 @xl/documents:flex">
          <div className="bg-background text-muted-foreground flex size-12 shrink-0 items-center justify-center rounded-md">
            <FileTextIcon className="size-5" aria-hidden="true" />
          </div>
          <p className="text-muted-foreground min-w-0 flex-1 text-sm">Todavía no se adjuntó documentación.</p>
          <div className="col-span-2 flex shrink-0 items-center justify-end gap-1 border-t pt-2 @xl/documents:border-0 @xl/documents:pt-0">
            {secondaryActions}
          </div>
        </div>
      )}
      {assistedUpload && canUpload ? (
        <section className="space-y-4 rounded-lg border p-4" aria-label="Carga asistida de documentación">
          <div className="space-y-1">
            <h4 className="text-sm font-medium">{attachment ? "Reemplazar en nombre del aspirante" : "Adjuntar en nombre del aspirante"}</h4>
            <p className="text-muted-foreground text-sm">
              Usá esta opción para documentación recibida por otro medio. La operación quedará registrada con tu usuario.
              {attachment ? " La entrega anterior se conservará en el historial." : ""}
            </p>
          </div>
          <DocumentUpload
            applicationId={applicationId}
            scope={scope}
            requirement={requirement}
            autoSave={false}
            disabled={disabled}
            onSaved={async () => {
              await onSaved();
              setAssistedUpload(false);
            }}
            onCancel={() => setAssistedUpload(false)}
          />
        </section>
      ) : null}
    </div>
  );
}
