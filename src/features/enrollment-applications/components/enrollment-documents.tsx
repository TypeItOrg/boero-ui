"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { FileTextIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { Input } from "@common/components/ui/input";
import { Textarea } from "@common/components/ui/textarea";
import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardFooter } from "@common/components/ui/card";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from "@common/components/ui/alert-dialog";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { DocumentRequirement } from "@features/enrollment-applications/types/document-requirement.types";
import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";
import {
  DOCUMENT_LEVEL_LABELS,
  DOCUMENT_STATUS_LABELS,
  DOCUMENT_MESSAGES,
} from "@features/enrollment-applications/constants/documentation.constants";
import { mutateDocument } from "@features/enrollment-applications/actions/documentation.actions";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { formatDocumentFileCategories } from "@features/enrollment-applications/utils/document-file-category.util";

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
      <EnrollmentStepCardHeader icon={FileTextIcon} title={title} description="Documentos requeridos para la inscripción y estado de las entregas." />
      <CardContent className="space-y-4">
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
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
              <h3 className="font-medium">{requirement.name}</h3>
              <Badge variant={requirement.status === "ACCEPTED" ? "success" : "outline"}>
                {DOCUMENT_STATUS_LABELS[requirement.status ?? "MISSING"]}
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              {DOCUMENT_LEVEL_LABELS[requirement.level]} · {formatDocumentFileCategories(requirement.allowedFormats)} · Hasta 10 MiB
            </p>
            {requirement.instructions ? <p className="text-sm whitespace-pre-wrap">{requirement.instructions}</p> : null}
            {requirement.currentAttachment ? (
              <Delivery file={requirement.currentAttachment} applicationId={application.applicationId} scope={scope} />
            ) : null}
            <div className="flex flex-wrap gap-2">
              {requirement.canUpload || requirement.canReplace ? (
                <Button type="button" variant="outline" onClick={() => setEditing({ requirement, operation: "upload" })}>
                  {requirement.canReplace ? "Reemplazar" : "Adjuntar"}
                </Button>
              ) : null}
              {requirement.canReview ? (
                <Button type="button" onClick={() => setEditing({ requirement, operation: "review" })}>
                  Revisar
                </Button>
              ) : null}
              <Button type="button" variant="outline" disabled={loading} onClick={() => void showHistory(requirement)}>
                Ver historial
              </Button>
              {requirement.canWithdraw ? (
                <Button type="button" variant="destructive" onClick={() => setEditing({ requirement, operation: "withdraw" })}>
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
              <Button variant="ghost" onClick={() => setHistory(null)}>
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
            <Input aria-label="Archivo" name="file" type="file" accept={requirement.allowedFormats.join(",")} required disabled={pending} />
          ) : null}
          {operation === "review" ? (
            <Textarea name="observation" aria-label="Observación" placeholder="Motivo de la observación" maxLength={2000} disabled={pending} />
          ) : null}
          {state.error ? (
            <p role="alert" className="text-destructive text-sm">
              {state.error}
            </p>
          ) : null}
          <AlertDialogFooter>
            <Button type="button" variant="outline" disabled={pending} onClick={onClose}>
              Cancelar
            </Button>
            {operation === "review" ? (
              <>
                <Button type="submit" name="status" value="OBSERVED" variant="outline" disabled={pending}>
                  Observar
                </Button>
                <Button type="submit" name="status" value="ACCEPTED" disabled={pending}>
                  Aceptar documento
                </Button>
              </>
            ) : (
              <Button type="submit" disabled={pending} variant={operation === "withdraw" ? "destructive" : "default"}>
                {pending ? "Guardando…" : title}
              </Button>
            )}
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
