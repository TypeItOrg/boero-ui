"use client";

import type { ReactElement, RefObject } from "react";

import { CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { rejectFileDragOutside } from "@common/components/ui/file-dropzone";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { AdministrativeDocument } from "@features/enrollment-applications/components/administrative-document";
import { DocumentSavedFile } from "@features/enrollment-applications/components/document-saved-file";
import { DocumentUpload } from "@features/enrollment-applications/components/document-upload";
import { EnrollmentDocumentRequirementActions } from "@features/enrollment-applications/components/enrollment-document-requirement-actions";
import { EnrollmentDocumentRequirementHeader } from "@features/enrollment-applications/components/enrollment-document-requirement-header";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";

export function EnrollmentDocumentRequirement({
  requirement,
  administrativeView,
  application,
  scope,
  disabled,
  showDeliveryHistory,
  showRequirementChanges,
  refresh,
  editDocument,
  activityTriggerRef,
  setActivity,
  autoSave,
  onUploadBlockedChange,
}: {
  requirement: DocumentRequirement;
  administrativeView: boolean;
  application: EnrollmentApplicationResponse;
  scope: AcademicScope;
  disabled: boolean;
  showDeliveryHistory: boolean;
  showRequirementChanges: boolean;
  refresh: () => Promise<void>;
  editDocument: (value: { requirement: DocumentRequirement; operation: "review" | "withdraw" } | null) => void;
  activityTriggerRef: RefObject<HTMLButtonElement | null>;
  setActivity: (value: { requirement: DocumentRequirement; initialTab: "deliveries" | "changes" } | null) => void;
  autoSave: boolean;
  onUploadBlockedChange: ((id: string, blocked: boolean) => void) | undefined;
}): ReactElement {
  return (
    <article key={requirement.id} aria-label={requirement.name} onDragOver={rejectFileDragOutside} onDrop={rejectFileDragOutside}>
      <div className="space-y-5 p-4 @3xl/documents:p-5">
        <EnrollmentDocumentRequirementHeader requirement={requirement} administrativeView={administrativeView} />
        {requirement.origin === "ADDITIONAL" || requirement.requestId ? (
          <div className="bg-muted/40 space-y-1 rounded-lg p-3 text-sm">
            <p className="font-medium">Documentación adicional solicitada</p>
            {requirement.requestId ? (
              <p className="text-muted-foreground leading-relaxed break-words whitespace-pre-wrap">
                {application.documentRequests?.find((request) => request.id === requirement.requestId)?.reason ??
                  "Consultá el pedido administrativo en este detalle."}
              </p>
            ) : null}
          </div>
        ) : null}
        {requirement.needsReplacement ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>Necesitás reemplazar el archivo</AlertTitle>
            <AlertDescription>Los formatos admitidos cambiaron. Reemplazá el archivo o retiralo si es opcional.</AlertDescription>
          </Alert>
        ) : null}
        <div className="min-w-0 space-y-4">
          {administrativeView ? (
            <AdministrativeDocument
              applicationId={application.applicationId}
              scope={scope}
              requirement={requirement}
              disabled={disabled}
              showDeliveryHistory={showDeliveryHistory}
              showRequirementChanges={showRequirementChanges}
              onSaved={refresh}
              onReview={() => editDocument({ requirement, operation: "review" })}
              onWithdraw={() => editDocument({ requirement, operation: "withdraw" })}
              onActivity={(initialTab, trigger) => {
                activityTriggerRef.current = trigger;
                setActivity({ requirement, initialTab });
              }}
            />
          ) : requirement.canUpload || requirement.canReplace ? (
            <DocumentUpload
              key={requirement.id}
              applicationId={application.applicationId}
              scope={scope}
              requirement={requirement}
              onSaved={refresh}
              autoSave={autoSave}
              disabled={disabled}
              onBlockedChange={onUploadBlockedChange}
              onWithdraw={requirement.canWithdraw && !disabled ? () => editDocument({ requirement, operation: "withdraw" }) : undefined}
            />
          ) : requirement.currentAttachment ? (
            <DocumentSavedFile
              file={requirement.currentAttachment}
              applicationId={application.applicationId}
              scope={scope}
              disabled={disabled}
              statusLabel={autoSave ? "Guardado en el borrador" : undefined}
              onWithdraw={requirement.canWithdraw && !disabled ? () => editDocument({ requirement, operation: "withdraw" }) : undefined}
            />
          ) : null}
          {requirement.currentAttachment?.observation ? (
            <Alert variant={requirement.currentAttachment.reviewStatus === "OBSERVED" ? "destructive" : "default"}>
              <CircleAlertIcon />
              <AlertTitle>Observación de la revisión</AlertTitle>
              <AlertDescription className="break-words whitespace-pre-wrap">{requirement.currentAttachment.observation}</AlertDescription>
            </Alert>
          ) : null}
          {!administrativeView && (showDeliveryHistory || showRequirementChanges || (requirement.canReview && requirement.currentAttachment)) ? (
            <EnrollmentDocumentRequirementActions
              requirement={requirement}
              editDocument={editDocument}
              showDeliveryHistory={showDeliveryHistory}
              activityTriggerRef={activityTriggerRef}
              setActivity={setActivity}
              showRequirementChanges={showRequirementChanges}
            />
          ) : null}
        </div>
      </div>
    </article>
  );
}
