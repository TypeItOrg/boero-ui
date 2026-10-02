"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import { FileTextIcon, PlusIcon, RefreshCwIcon, CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@common/components/ui/alert-dialog";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";

import { FormField } from "@features/academic/components/academic-form-controls";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { mutateDocument } from "@features/enrollment-applications/actions/documentation.actions";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { RequestDocumentsDialog } from "@features/enrollment-applications/components/request-documents-dialog";
import {
  DOCUMENT_LEVEL_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_MESSAGES,
} from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";
import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";

export function EnrollmentDocuments({
  application,
  scope = "institutional",
  title = "Documentación",
  footer,
}: {
  application: EnrollmentApplicationResponse;
  scope?: AcademicScope;
  title?: string;
  footer?: React.ReactNode;
}): React.ReactElement | null {
  const router = useRouter();
  const [documentSnapshot, setDocumentSnapshot] = React.useState({
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
  const [requesting, setRequesting] = React.useState(false);
  const [requestUncertain, setRequestUncertain] = React.useState(false);
  const [error, setError] = React.useState("");
  const [editing, setEditing] = React.useState<{ requirement: DocumentRequirement; operation: "upload" | "review" | "withdraw" } | null>(null);
  const [history, setHistory] = React.useState<{
    requirement: DocumentRequirement;
    items: DocumentDelivery[];
    page: number;
    totalPages: number;
  } | null>(null);
  const [loading, setLoading] = React.useState(false);
  const url = `/api/enrollment-applications/${application.applicationId}/documents?scope=${scope}`;
  async function refresh(): Promise<void> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(DOCUMENT_MESSAGES.readFailed);
    }
    setDocumentSnapshot({ applicationId: application.applicationId, scope, source: application.documents, documents: await response.json() });
    setHistory(null);
    router.refresh();
  }
  async function showHistory(requirement: DocumentRequirement, page = 0): Promise<void> {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${url}&requirementId=${requirement.id}&page=${page}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error();
      }
      const value = (await response.json()) as { items: DocumentDelivery[]; totalPages: number };
      setHistory({ requirement, items: value.items, page, totalPages: value.totalPages });
    } catch {
      setError(DOCUMENT_MESSAGES.readFailed);
    } finally {
      setLoading(false);
    }
  }
  if (!application.canReadAttachments) {
    return null;
  }
  return (
    <Card className="bg-muted/25 sm:[--card-spacing:--spacing(6)]" role="region" aria-label="Documentación">
      <EnrollmentStepCardHeader
        icon={FileTextIcon}
        title={title}
        description="Documentos requeridos para la inscripción y estado de las entregas."
        action={
          <div className="flex flex-wrap gap-3 [&>button]:flex-[1_0_min(180px,100%)] sm:[&>button]:flex-none">
            <Button
              size="lg"
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => {
                setLoading(true);
                void refresh()
                  .catch(() => setError(DOCUMENT_MESSAGES.readFailed))
                  .finally(() => setLoading(false));
              }}
            >
              <RefreshCwIcon className={loading ? "animate-spin" : undefined} />
              Actualizar documentación
            </Button>
            {application.canRequestDocuments ? (
              <>
                <Button size="lg" type="button" disabled={requestUncertain} onClick={() => setRequesting(true)}>
                  <PlusIcon />
                  Solicitar documentación
                </Button>
                {requestUncertain ? (
                  <Button
                    size="lg"
                    type="button"
                    variant="outline"
                    onClick={() =>
                      void refresh()
                        .then(() => setRequestUncertain(false))
                        .catch(() => setError("No se pudo recargar el detalle. Intentá nuevamente."))
                    }
                  >
                    Recargar detalle antes de reintentar
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        }
      />
      <CardContent className="space-y-4">
        {application.documentRequests?.map((request) => (
          <section key={request.id} className="space-y-2 border-b pb-4" aria-label="Pedido de documentación">
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
        {documents.map((requirement) => (
          <article key={requirement.id} className="bg-muted/20 space-y-3 rounded-lg border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="max-w-full min-w-0 font-medium break-words">{requirement.name}</h3>
              <Badge variant={requirement.active === false ? "secondary" : requirement.status === "ACCEPTED" ? "success" : "outline"}>
                {requirement.active === false ? "Requisito retirado" : DOCUMENT_STATUS_LABELS[requirement.status ?? "MISSING"]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {requirement.origin === "ADDITIONAL" && requirement.level === "AT_SUBMISSION"
                ? "Obligatorio antes de aprobar"
                : DOCUMENT_LEVEL_LABELS[requirement.level]}{" "}
              · {formatDocumentFileCategories(requirement.allowedFormats)} · Hasta 10 MiB
            </p>
            {requirement.origin === "ADDITIONAL" ? <p className="text-sm font-medium">Documentación adicional solicitada</p> : null}
            {requirement.requestId ? (
              <p className="text-sm break-words whitespace-pre-wrap">
                Motivo:{" "}
                {application.documentRequests?.find((request) => request.id === requirement.requestId)?.reason ??
                  "Consultá el pedido administrativo en este detalle."}
              </p>
            ) : null}
            {requirement.instructions ? <p className="text-sm break-words whitespace-pre-wrap">{requirement.instructions}</p> : null}
            {requirement.specificInstructions ? (
              <p className="text-sm break-words whitespace-pre-wrap">Para este trayecto: {requirement.specificInstructions}</p>
            ) : null}
            {requirement.needsReplacement ? (
              <Alert variant="destructive">
                <CircleAlertIcon />
                <AlertDescription>Los formatos admitidos cambiaron. Reemplazá el archivo o retiralo si es opcional.</AlertDescription>
              </Alert>
            ) : null}
            {requirement.changes?.length ? (
              <details className="text-sm">
                <summary className="cursor-pointer">Cambios en el requisito</summary>
                <ul className="mt-2 space-y-1">
                  {requirement.changes.map((change, index) => (
                    <li key={index}>
                      {({ ADDED: "Agregado", UPDATED: "Modificado", RETIRED: "Retirado", REACTIVATED: "Reactivado" } as Record<string, string>)[
                        change.action
                      ] ?? change.action}{" "}
                      · {formatEnrollmentApplicationDateTime(change.occurredAt)}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
            {requirement.currentAttachment ? (
              <Delivery file={requirement.currentAttachment} applicationId={application.applicationId} scope={scope} />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {requirement.canUpload || requirement.canReplace ? (
                <Button size="lg" type="button" variant="outline" onClick={() => setEditing({ requirement, operation: "upload" })}>
                  {requirement.canReplace ? "Reemplazar" : "Adjuntar"}
                </Button>
              ) : null}
              {requirement.canReview ? (
                <Button size="lg" type="button" onClick={() => setEditing({ requirement, operation: "review" })}>
                  Revisar
                </Button>
              ) : null}
              <Button size="lg" type="button" variant="outline" disabled={loading} onClick={() => void showHistory(requirement)}>
                Ver historial
              </Button>
              {requirement.canWithdraw ? (
                <Button size="lg" type="button" variant="destructive" onClick={() => setEditing({ requirement, operation: "withdraw" })}>
                  Retirar entrega
                </Button>
              ) : null}
            </div>
          </article>
        ))}
        {history ? (
          <section className="space-y-3 rounded-lg border p-4">
            <div className="flex justify-between gap-2">
              <h3 className="font-medium">Historial · {history.requirement.name}</h3>
              <Button size="lg" variant="ghost" onClick={() => setHistory(null)}>
                Cerrar
              </Button>
            </div>
            {history.items.map((file) => (
              <div className="rounded-lg border p-3" key={file.id}>
                <Badge variant="outline">
                  {file.versionStatus === "CURRENT" ? "Vigente" : file.versionStatus === "SUPERSEDED" ? "Reemplazada" : "Retirada"}
                </Badge>
                <Delivery file={file} applicationId={application.applicationId} scope={scope} />
              </div>
            ))}
            {!history.items.length ? <p>No hay entregas registradas.</p> : null}
            <div className="flex items-center gap-3">
              <Button
                size="lg"
                variant="outline"
                disabled={loading || history.page === 0}
                onClick={() => void showHistory(history.requirement, history.page - 1)}
              >
                Anterior
              </Button>
              <span>
                Página {history.page + 1} de {Math.max(1, history.totalPages)}
              </span>
              <Button
                size="lg"
                variant="outline"
                disabled={loading || history.page + 1 >= history.totalPages}
                onClick={() => void showHistory(history.requirement, history.page + 1)}
              >
                Siguiente
              </Button>
            </div>
          </section>
        ) : null}
        {editing ? (
          <DocumentMutation applicationId={application.applicationId} scope={scope} {...editing} onClose={() => setEditing(null)} onSaved={refresh} />
        ) : null}
      </CardContent>
      {footer ? (
        <CardFooter className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">{footer}</CardFooter>
      ) : null}
    </Card>
  );
}

function Delivery({ file, applicationId, scope }: { file: DocumentDelivery; applicationId: string; scope: AcademicScope }): React.ReactElement {
  return (
    <div className="space-y-1 py-2 text-sm">
      <a className="font-medium underline" href={getAttachmentDownloadUrl(applicationId, file.id, scope)} target="_blank" rel="noreferrer">
        {file.originalFileName}
      </a>
      <p className="text-muted-foreground">
        <span className={DETAIL_LABEL_CLASS_NAME}>Entrega:</span> {formatEnrollmentApplicationDateTime(file.createdAt)} ·{" "}
        {DOCUMENT_STATUS_LABELS[file.reviewStatus]}
      </p>
      <p>
        <span className={DETAIL_LABEL_CLASS_NAME}>Presentado por:</span>{" "}
        {file.uploaderType === "PLATFORM" ? "Administración de plataforma" : "Cuenta institucional"}
        {file.uploadedBy ? ` (${file.uploadedBy})` : ""}
      </p>
      {file.reviewedAt ? (
        <p>
          <span className={DETAIL_LABEL_CLASS_NAME}>Revisión:</span> {formatEnrollmentApplicationDateTime(file.reviewedAt)} ·{" "}
          {file.reviewerType === "PLATFORM" ? "Administración de plataforma" : "Personal institucional"}
          {file.reviewedBy ? ` (${file.reviewedBy})` : ""}
        </p>
      ) : null}
      {file.observation ? <p className="whitespace-pre-wrap">{file.observation}</p> : null}
    </div>
  );
}

function DocumentMutation({
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
  operation: "upload" | "review" | "withdraw";
  onClose: () => void;
  onSaved: () => Promise<void>;
}): React.ReactElement {
  const title =
    operation === "upload"
      ? requirement.currentAttachment
        ? "Reemplazar documento"
        : "Adjuntar documento"
      : operation === "review"
        ? "Revisar documento"
        : "Retirar entrega";
  const [state, action, pending] = React.useActionState(async (previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
    try {
      const result = await mutateDocument(
        scope,
        applicationId,
        operation,
        operation === "upload" ? requirement.id : requirement.currentAttachment!.id,
        previous,
        form,
      );
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
      <AlertDialogContent>
        <form action={action} className="space-y-4">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>
              <strong className="text-foreground">{requirement.name}</strong>
              {operation === "withdraw" ? ": el archivo seguirá disponible en el historial." : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {operation === "upload" ? (
            <FormField name={`document-file-${requirement.id}`} label="Archivo" required>
              <Input
                id={`document-file-${requirement.id}`}
                name="file"
                type="file"
                accept={requirement.allowedFormats.join(",")}
                required
                disabled={pending}
              />
            </FormField>
          ) : null}
          {operation === "review" ? (
            <FormField name={`document-observation-${requirement.id}`} label="Observación">
              <Textarea
                id={`document-observation-${requirement.id}`}
                name="observation"
                placeholder="Motivo de la observación"
                maxLength={2000}
                disabled={pending}
              />
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
                <Button size="lg" type="submit" name="status" value="ACCEPTED" disabled={pending}>
                  Aceptar documento
                </Button>
              </>
            ) : (
              <Button size="lg" type="submit" disabled={pending} variant={operation === "withdraw" ? "destructive" : "default"}>
                {pending ? "Guardando…" : title}
              </Button>
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
