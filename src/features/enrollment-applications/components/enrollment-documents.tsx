"use client";

import { useRef, useState, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { CircleAlertIcon, FileTextIcon } from "lucide-react";

import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";

import { DocumentActivity } from "@features/enrollment-applications/components/document-activity";
import { DocumentMutation } from "@features/enrollment-applications/components/document-mutation-dialog";
import { EnrollmentDocumentRequirement } from "@features/enrollment-applications/components/enrollment-document-requirement";
import { EnrollmentDocumentStepHeader } from "@features/enrollment-applications/components/enrollment-document-step-header";
import { RequestDocumentsDialog } from "@features/enrollment-applications/components/request-documents-dialog";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentDocumentsProps } from "@features/enrollment-applications/types/enrollment-documents-props.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";

export function EnrollmentDocuments({
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
  const router = useRouter();
  const [documentSnapshot, setDocumentSnapshot] = useState({
    applicationId: application.applicationId,
    scope,
    source: application.documents,
    documents: application.documents ?? [],
  });
  // Draft autosaves replace the application object without changing its document data.
  const documents =
    documentSnapshot.applicationId === application.applicationId &&
    documentSnapshot.scope === scope &&
    documentSnapshot.source === application.documents
      ? documentSnapshot.documents
      : (application.documents ?? []);
  const [requesting, setRequesting] = useState(false);
  const [requestUncertain, setRequestUncertain] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<{
    requirement: DocumentRequirement;
    operation: "review" | "withdraw";
  } | null>(null);

  function editDocument(value: typeof editing): void {
    if (disabled && value) {
      return;
    }

    onUploadBlockedChange?.("document-dialog", value !== null);
    setEditing(value);
  }

  const activityTriggerRef = useRef<HTMLButtonElement>(null);
  const [activity, setActivity] = useState<{
    requirement: DocumentRequirement;
    initialTab: "deliveries" | "changes";
  } | null>(null);
  const url = `/api/enrollment-applications/${application.applicationId}/documents?scope=${scope}`;

  async function refresh(): Promise<void> {
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(DOCUMENT_MESSAGES.readFailed);
    }

    setDocumentSnapshot({
      applicationId: application.applicationId,
      scope,
      source: application.documents,
      documents: await response.json(),
    });
    setActivity(null);
    router.refresh();
  }

  if (!application.canReadAttachments) {
    return null;
  }

  return (
    <Card className="bg-muted/25 @container/documents sm:[--card-spacing:--spacing(6)]" role="region" aria-label="Documentación">
      <EnrollmentDocumentStepHeader
        title={title}
        application={application}
        requestUncertain={requestUncertain}
        setRequesting={setRequesting}
        refresh={refresh}
        setRequestUncertain={setRequestUncertain}
        setError={setError}
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
            onUncertain={() => setRequestUncertain(true)}
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
