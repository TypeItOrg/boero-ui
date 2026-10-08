"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon, FileTextIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

import { DocumentActivity } from "@features/enrollment-applications/components/document-activity";
import { DocumentMutation } from "@features/enrollment-applications/components/document-mutation-dialog";
import { EnrollmentDocumentRequirement } from "@features/enrollment-applications/components/enrollment-document-requirement";
import { EnrollmentDocumentStepHeader } from "@features/enrollment-applications/components/enrollment-document-step-header";
import { RequestDocumentsDialog } from "@features/enrollment-applications/components/request-documents-dialog";
import { useEnrollmentDocuments } from "@features/enrollment-applications/hooks/use-enrollment-documents";
import type { EnrollmentDocumentsProps } from "@features/enrollment-applications/types/enrollment-documents-props.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";

export function EnrollmentDocuments(props: EnrollmentDocumentsProps): ReactElement | null {
  return <EnrollmentDocumentsView key={`${props.scope ?? "institutional"}:${props.application.applicationId}`} {...props} />;
}

function EnrollmentDocumentsView({
  application,
  scope = "institutional",
  title = "Documentación",
  footer,
  showRequirementChanges = false,
  showDeliveryHistory = showRequirementChanges,
  administrativeView = false,
  autoSave = false,
  disabled = false,
  onUploadBlockedChange,
}: EnrollmentDocumentsProps): ReactElement | null {
  const {
    documents,
    requesting,
    requestUncertain,
    error,
    editing,
    activity,
    activityTriggerRef,
    editDocument,
    setActivity,
    setRequesting,
    markRequestUncertain,
    reload,
    refresh,
  } = useEnrollmentDocuments({ application, scope, disabled, onUploadBlockedChange });

  if (!application.canReadAttachments) {
    return null;
  }

  return (
    <Card className="bg-muted/25 @container/documents sm:[--card-spacing:--spacing(6)]" role="region" aria-label="Documentación">
      <EnrollmentDocumentStepHeader
        title={title}
        application={application}
        requestUncertain={requestUncertain}
        onRequest={() => setRequesting(true)}
        onReload={reload}
      />
      <CardContent className="space-y-4">
        {application.documentRequests?.map((request) => (
          <section key={request.id} className="-mx-(--card-spacing) space-y-2 border-b px-(--card-spacing) pb-4" aria-label="Pedido de documentación">
            <h3 className="font-medium">Pedido de documentación adicional</h3>
            <p className="text-sm break-words whitespace-pre-wrap">{request.reason}</p>
            <p className="text-muted-foreground text-sm">
              {formatEnrollmentApplicationDateTime(request.createdAt)} · Responsable: {request.actorName}
            </p>
          </section>
        ))}
        {requesting ? (
          <RequestDocumentsDialog
            application={application}
            scope={scope}
            onClose={() => setRequesting(false)}
            onSaved={refresh}
            onUncertain={markRequestUncertain}
          />
        ) : null}
        {error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {documents.length === 0 ? (
          <Empty className="bg-muted/25 rounded-lg px-4 py-10">
            <EmptyHeader className="max-w-md">
              <EmptyMedia variant="icon">
                <FileTextIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">No se requiere documentación</EmptyTitle>
              <EmptyDescription>Este trayecto no solicita documentación para la inscripción.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : null}
        {documents.length > 0 ? (
          <div className="bg-background divide-y overflow-hidden rounded-xl border">
            {documents.map((requirement) => (
              <EnrollmentDocumentRequirement
                key={requirement.id}
                requirement={requirement}
                administrativeView={administrativeView}
                application={application}
                scope={scope}
                disabled={disabled}
                showDeliveryHistory={showDeliveryHistory}
                showRequirementChanges={showRequirementChanges}
                refresh={refresh}
                editDocument={editDocument}
                activityTriggerRef={activityTriggerRef}
                setActivity={setActivity}
                autoSave={autoSave}
                onUploadBlockedChange={onUploadBlockedChange}
              />
            ))}
          </div>
        ) : null}
        {activity ? (
          <DocumentActivity
            key={activity.requirement.id}
            applicationId={application.applicationId}
            scope={scope}
            {...activity}
            showRequirementChanges={showRequirementChanges}
            onClose={() => setActivity(null)}
            onReturnFocus={() => activityTriggerRef.current?.focus()}
          />
        ) : null}
        {editing ? (
          <DocumentMutation
            applicationId={application.applicationId}
            scope={scope}
            {...editing}
            onClose={() => editDocument(null)}
            onSaved={refresh}
          />
        ) : null}
      </CardContent>
      {footer ? (
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">{footer}</CardFooter>
      ) : null}
    </Card>
  );
}
