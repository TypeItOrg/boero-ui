"use client";

import * as React from "react";

import { useRouter } from "next/navigation";

import {
  FileTextIcon,
  PlusIcon,
  RefreshCwIcon,
  CircleAlertIcon,
  UploadIcon,
  HistoryIcon,
  XIcon,
  PencilLineIcon,
  ArchiveIcon,
  RotateCcwIcon,
  DownloadIcon,
  LoaderCircleIcon,
  MoreHorizontalIcon,
} from "lucide-react";

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
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@common/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@common/components/ui/tabs";
import { Skeleton } from "@common/components/ui/skeleton";
import { Textarea } from "@common/components/ui/textarea";
import { FileDropzone, rejectFileDragOutside } from "@common/components/ui/file-dropzone";
import { FileUploadSelection } from "@common/components/ui/file-upload-selection";
import { FieldError } from "@common/components/ui/field";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@common/components/ui/dropdown-menu";

import { FormField } from "@features/academic/components/academic-form-controls";
import { TrainingPathDocumentInstructions } from "@features/academic/components/training-path-document-instructions";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { mutateDocument } from "@features/enrollment-applications/actions/documentation.actions";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { DocumentFilePreview } from "@features/enrollment-applications/components/document-file-preview";
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
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";

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
}: {
  application: EnrollmentApplicationResponse;
  scope?: AcademicScope;
  title?: string;
  footer?: React.ReactNode;
  showRequirementChanges?: boolean;
  showDeliveryHistory?: boolean;
  administrativeView?: boolean;
  autoSave?: boolean;
  disabled?: boolean;
  onUploadBlockedChange?: (id: string, blocked: boolean) => void;
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
  const [editing, setEditing] = React.useState<{ requirement: DocumentRequirement; operation: "review" | "withdraw" } | null>(null);
  function editDocument(value: typeof editing): void {
    if (disabled && value) {
      return;
    }
    onUploadBlockedChange?.("document-dialog", value !== null);
    setEditing(value);
  }
  const activityTriggerRef = React.useRef<HTMLButtonElement>(null);
  const [activity, setActivity] = React.useState<{
    requirement: DocumentRequirement;
    initialTab: "deliveries" | "changes";
  } | null>(null);
  const url = `/api/enrollment-applications/${application.applicationId}/documents?scope=${scope}`;
  async function refresh(): Promise<void> {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(DOCUMENT_MESSAGES.readFailed);
    }
    setDocumentSnapshot({ applicationId: application.applicationId, scope, source: application.documents, documents: await response.json() });
    setActivity(null);
    router.refresh();
  }
  if (!application.canReadAttachments) {
    return null;
  }
  return (
    <Card className="bg-muted/25 @container/documents sm:[--card-spacing:--spacing(6)]" role="region" aria-label="Documentación">
      <EnrollmentStepCardHeader
        icon={FileTextIcon}
        title={title}
        description="Documentos requeridos para la inscripción y estado de las entregas."
        actionClassName="@xl/section-header:self-stretch"
        action={
          application.canRequestDocuments ? (
            <div className="flex h-full flex-wrap gap-3 [&>button]:flex-[1_0_min(180px,100%)] @xl/section-header:[&>button]:flex-none">
              <Button
                size="lg"
                className="h-11 w-full @xl/section-header:h-full @xl/section-header:w-11"
                type="button"
                aria-label="Solicitar documentación"
                title="Solicitar documentación"
                disabled={requestUncertain}
                onClick={() => setRequesting(true)}
              >
                <PlusIcon aria-hidden="true" />
                <span className="@xl/section-header:hidden">Solicitar documentación</span>
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
                  <RefreshCwIcon />
                  Recargar detalle antes de reintentar
                </Button>
              ) : null}
            </div>
          ) : undefined
        }
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
              <article key={requirement.id} aria-label={requirement.name} onDragOver={rejectFileDragOutside} onDrop={rejectFileDragOutside}>
                <div className="space-y-5 p-4 @3xl/documents:p-5">
                  <header className="flex min-w-0 flex-col gap-3 @3xl/documents:flex-row @3xl/documents:items-center @3xl/documents:justify-between @3xl/documents:gap-6">
                    <div className="flex min-w-0 items-center gap-1.5 @3xl/documents:flex-1">
                      <h3 className="min-w-0 text-lg leading-snug font-semibold break-words">{requirement.name}</h3>
                      <TrainingPathDocumentInstructions
                        name={requirement.name}
                        instructions={requirement.instructions}
                        specificInstructions={requirement.specificInstructions}
                        className="shrink-0"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 @3xl/documents:justify-end">
                      <Badge variant="secondary" size="lg" className={administrativeView ? "w-full @xl/documents:w-fit" : undefined}>
                        {requirement.origin === "ADDITIONAL" && requirement.level === "AT_SUBMISSION"
                          ? "Obligatorio antes de aprobar"
                          : DOCUMENT_LEVEL_LABELS[requirement.level]}
                      </Badge>
                      <Badge
                        size="lg"
                        className={administrativeView ? "w-full @xl/documents:w-fit" : undefined}
                        variant={
                          requirement.active === false
                            ? "secondary"
                            : requirement.status === "ACCEPTED"
                              ? "success"
                              : requirement.status === "OBSERVED"
                                ? "destructive"
                                : "outline"
                        }
                      >
                        {requirement.active === false ? "Requisito retirado" : DOCUMENT_STATUS_LABELS[requirement.status ?? "MISSING"]}
                      </Badge>
                    </div>
                  </header>
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
                    {!administrativeView &&
                    (showDeliveryHistory || showRequirementChanges || (requirement.canReview && requirement.currentAttachment)) ? (
                      <div className="flex flex-wrap gap-2">
                        {requirement.canReview && requirement.currentAttachment ? (
                          <Button size="lg" className="min-h-11" type="button" onClick={() => editDocument({ requirement, operation: "review" })}>
                            Revisar documento
                          </Button>
                        ) : null}
                        {showDeliveryHistory ? (
                          <Button
                            size="lg"
                            className="min-h-11"
                            type="button"
                            variant="outline"
                            aria-haspopup="dialog"
                            onClick={(event) => {
                              activityTriggerRef.current = event.currentTarget;
                              setActivity({ requirement, initialTab: "deliveries" });
                            }}
                          >
                            <HistoryIcon aria-hidden="true" />
                            Ver historial
                          </Button>
                        ) : null}
                        {showRequirementChanges && requirement.changes?.length ? (
                          <Button
                            size="lg"
                            className="min-h-11"
                            type="button"
                            variant="ghost"
                            aria-haspopup="dialog"
                            onClick={(event) => {
                              activityTriggerRef.current = event.currentTarget;
                              setActivity({ requirement, initialTab: "changes" });
                            }}
                          >
                            <PencilLineIcon aria-hidden="true" />
                            Cambios del requisito
                          </Button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
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

function DocumentSavedFile({
  file,
  applicationId,
  scope,
  disabled = false,
  statusLabel = `Adjuntado el ${formatEnrollmentApplicationDateTime(file.createdAt)}`,
  secondaryActions,
  primaryAction,
  onWithdraw,
}: {
  file: DocumentDelivery;
  applicationId: string;
  scope: AcademicScope;
  disabled?: boolean;
  statusLabel?: string;
  secondaryActions?: React.ReactNode;
  primaryAction?: React.ReactNode;
  onWithdraw?: () => void;
}): React.ReactElement {
  return (
    <FileUploadSelection
      label="Archivo guardado"
      name={file.originalFileName}
      statusLabel={statusLabel}
      preview={
        <DocumentFilePreview
          key={file.id}
          src={getAttachmentDownloadUrl(applicationId, file.id, scope)}
          name={file.originalFileName}
          contentType={file.contentType}
          compact
        />
      }
      previewAction={
        <DocumentFilePreview
          src={getAttachmentDownloadUrl(applicationId, file.id, scope)}
          name={file.originalFileName}
          contentType={file.contentType}
          iconOnly
          triggerLabel={
            secondaryActions !== undefined || primaryAction !== undefined ? <span className="@xl/file-selection:hidden">Ver</span> : undefined
          }
        />
      }
      secondaryActions={secondaryActions}
      primaryAction={primaryAction}
      removeLabel={`Retirar ${file.originalFileName}`}
      disabled={disabled}
      onRemove={onWithdraw}
    />
  );
}

function AdministrativeDocument({
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
}): React.ReactElement {
  const [assistedUpload, setAssistedUpload] = React.useState(false);
  const menuTriggerRef = React.useRef<HTMLButtonElement>(null);
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

function Delivery({
  file,
  applicationId,
  scope,
  showReviewStatus = false,
}: {
  file: DocumentDelivery;
  applicationId: string;
  scope: AcademicScope;
  showReviewStatus?: boolean;
}): React.ReactElement {
  return (
    <div className="@container/delivery min-w-0 space-y-4 text-sm">
      <div className="grid items-start gap-4 @lg/delivery:grid-cols-[16rem_minmax(0,1fr)]">
        <DocumentFilePreview
          key={file.id}
          src={getAttachmentDownloadUrl(applicationId, file.id, scope)}
          name={file.originalFileName}
          contentType={file.contentType}
        />
        <div className="min-w-0 space-y-4">
          <a
            className="group focus-visible:outline-ring flex min-h-11 min-w-0 items-center gap-3 rounded-md underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
            href={getAttachmentDownloadUrl(applicationId, file.id, scope)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Descargar ${file.originalFileName}`}
          >
            <span className="min-w-0 flex-1 font-medium break-all">{file.originalFileName}</span>
            <DownloadIcon aria-hidden="true" className="text-muted-foreground group-hover:text-foreground size-4 shrink-0" />
          </a>
          <dl className="grid gap-x-4 gap-y-3 text-sm @xs/delivery:grid-cols-2">
            <div className="min-w-0 space-y-1">
              <dt className="text-muted-foreground text-xs">Presentado el</dt>
              <dd>
                <time dateTime={file.createdAt}>{formatEnrollmentApplicationDateTime(file.createdAt)}</time>
              </dd>
            </div>
            <div className="min-w-0 space-y-1">
              <dt className="text-muted-foreground text-xs">Tipo de cuenta</dt>
              <dd>{file.uploaderType === "PLATFORM" ? "Administración de plataforma" : "Cuenta institucional"}</dd>
            </div>
            {showReviewStatus ? (
              <div className="min-w-0 space-y-1">
                <dt className="text-muted-foreground text-xs">Estado de revisión</dt>
                <dd>{DOCUMENT_STATUS_LABELS[file.reviewStatus]}</dd>
              </div>
            ) : null}
            {file.reviewedAt ? (
              <>
                <div className="min-w-0 space-y-1">
                  <dt className="text-muted-foreground text-xs">Revisado el</dt>
                  <dd>
                    <time dateTime={file.reviewedAt}>{formatEnrollmentApplicationDateTime(file.reviewedAt)}</time>
                  </dd>
                </div>
                <div className="min-w-0 space-y-1">
                  <dt className="text-muted-foreground text-xs">Revisado por</dt>
                  <dd>{file.reviewerType === "PLATFORM" ? "Administración de plataforma" : "Personal institucional"}</dd>
                </div>
              </>
            ) : null}
          </dl>
          {file.observation ? (
            <Alert variant={file.reviewStatus === "OBSERVED" ? "destructive" : "default"}>
              <CircleAlertIcon />
              <AlertTitle>Observación de la revisión</AlertTitle>
              <AlertDescription className="break-words whitespace-pre-wrap">{file.observation}</AlertDescription>
            </Alert>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function DocumentActivity({
  applicationId,
  scope,
  requirement,
  initialTab,
  showRequirementChanges,
  onClose,
  onReturnFocus,
}: {
  applicationId: string;
  scope: AcademicScope;
  requirement: DocumentRequirement;
  initialTab: "deliveries" | "changes";
  showRequirementChanges: boolean;
  onClose: () => void;
  onReturnFocus: () => void;
}): React.ReactElement {
  const [page, setPage] = React.useState(0);
  const [retry, setRetry] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [history, setHistory] = React.useState<{ items: DocumentDelivery[]; totalPages: number }>({ items: [], totalPages: 0 });
  const url = `/api/enrollment-applications/${applicationId}/documents?scope=${scope}&requirementId=${requirement.id}&page=${page}`;

  React.useEffect(() => {
    const controller = new AbortController();

    async function loadHistory(): Promise<void> {
      try {
        const response = await fetch(url, { cache: "no-store", signal: controller.signal });
        if (!response.ok) {
          throw new Error(DOCUMENT_MESSAGES.readFailed);
        }
        const value = (await response.json()) as { items: DocumentDelivery[]; totalPages: number };
        if (!controller.signal.aborted) {
          setHistory(value);
        }
      } catch {
        if (!controller.signal.aborted) {
          setError(DOCUMENT_MESSAGES.readFailed);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadHistory();
    return () => controller.abort();
  }, [url, retry]);

  function changePage(nextPage: number): void {
    setLoading(true);
    setError("");
    setPage(nextPage);
  }

  const deliveries = (
    <>
      {loading ? (
        <div role="status" className="space-y-5">
          <span className="sr-only">Cargando entregas…</span>
          {[0, 1].map((item) => (
            <div key={item} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-3/4" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>No se pudo cargar el historial</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              type="button"
              variant="outline"
              className="mt-3 min-h-11 w-fit"
              onClick={() => {
                setError("");
                setLoading(true);
                setRetry((value) => value + 1);
              }}
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      ) : history.items.length > 0 ? (
        <ol className="divide-y">
          {history.items.map((file) => (
            <li key={file.id} className="space-y-3 py-5 first:pt-0">
              <div className="flex items-center gap-2">
                <Badge variant={file.versionStatus === "CURRENT" ? "secondary" : "outline"}>
                  {file.versionStatus === "CURRENT" ? "Entrega vigente" : file.versionStatus === "SUPERSEDED" ? "Reemplazada" : "Retirada"}
                </Badge>
              </div>
              <Delivery file={file} applicationId={applicationId} scope={scope} showReviewStatus />
            </li>
          ))}
        </ol>
      ) : (
        <Empty className="py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <HistoryIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Todavía no hay entregas</EmptyTitle>
            <EmptyDescription>Cuando se presente un archivo, sus versiones van a aparecer acá.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {!loading && !error && history.totalPages > 1 ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t pt-4">
          <Button type="button" variant="outline" className="min-h-11" disabled={page === 0} onClick={() => changePage(page - 1)}>
            Anterior
          </Button>
          <span className="text-muted-foreground text-xs">
            Página {page + 1} de {history.totalPages}
          </span>
          <Button type="button" variant="outline" className="min-h-11" disabled={page + 1 >= history.totalPages} onClick={() => changePage(page + 1)}>
            Siguiente
          </Button>
        </div>
      ) : null}
    </>
  );

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          onReturnFocus();
        }}
        showCloseButton={false}
        className="gap-0 data-[side=right]:w-full data-[side=right]:sm:max-w-xl"
      >
        <SheetHeader className="gap-2 border-b p-5 pr-16">
          <SheetTitle className="text-lg font-semibold">Historial del documento</SheetTitle>
          <SheetDescription className="break-words">{requirement.name}</SheetDescription>
        </SheetHeader>
        <SheetClose asChild>
          <Button type="button" variant="ghost" size="icon-lg" className="absolute top-4 right-4 size-11" aria-label="Cerrar historial">
            <XIcon aria-hidden="true" />
          </Button>
        </SheetClose>
        {showRequirementChanges ? (
          <Tabs defaultValue={initialTab} className="min-h-0 flex-1 gap-0">
            <div className="border-b px-5 py-3">
              <TabsList className="w-full group-data-horizontal/tabs:h-auto" aria-label="Tipo de historial">
                <TabsTrigger className="min-h-11" value="deliveries">
                  Entregas
                </TabsTrigger>
                <TabsTrigger className="min-h-11" value="changes">
                  Cambios del requisito
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="deliveries" className="min-h-0 overflow-y-auto p-5" aria-busy={loading}>
              {deliveries}
            </TabsContent>
            <TabsContent value="changes" className="min-h-0 overflow-y-auto p-5">
              <DocumentChanges requirement={requirement} />
            </TabsContent>
          </Tabs>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto p-5" aria-label="Historial de entregas" aria-busy={loading}>
            {deliveries}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DocumentChanges({ requirement }: { requirement: DocumentRequirement }): React.ReactElement {
  const changes = [...(requirement.changes ?? [])].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const events: Record<string, { title: string; icon: typeof PlusIcon }> = {
    ADDED: { title: "Requisito agregado", icon: PlusIcon },
    UPDATED: { title: "Requisito actualizado", icon: PencilLineIcon },
    RETIRED: { title: "Requisito retirado", icon: ArchiveIcon },
    REACTIVATED: { title: "Requisito reactivado", icon: RotateCcwIcon },
  };

  if (changes.length === 0) {
    return (
      <Empty className="py-12">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PencilLineIcon aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle>No hay cambios registrados</EmptyTitle>
          <EmptyDescription>Las actualizaciones de este requisito van a aparecer acá.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <ol className="space-y-6" aria-label="Cambios del requisito">
      {changes.map((change, index) => {
        const event = events[change.action] ?? { title: "Cambio registrado", icon: PencilLineIcon };
        const Icon = event.icon;
        return (
          <li key={`${change.occurredAt}-${index}`} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
            {index < changes.length - 1 ? <span aria-hidden="true" className="bg-border absolute top-10 -bottom-6 left-5 w-px" /> : null}
            <span className="bg-muted text-muted-foreground relative flex size-10 items-center justify-center rounded-lg">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1 pt-0.5">
              <h3 className="text-sm font-medium">{event.title}</h3>
              <time className="text-muted-foreground block text-xs" dateTime={change.occurredAt}>
                {formatEnrollmentApplicationDateTime(change.occurredAt)}
              </time>
              {change.name !== requirement.name ? <p className="pt-1 text-sm break-words">Documento: {change.name}</p> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function DocumentUpload({
  applicationId,
  scope,
  requirement,
  onSaved,
  autoSave,
  disabled: externallyDisabled,
  onBlockedChange,
  onWithdraw,
  onCancel,
}: {
  applicationId: string;
  scope: AcademicScope;
  requirement: DocumentRequirement;
  onSaved: () => Promise<void>;
  autoSave: boolean;
  disabled: boolean;
  onBlockedChange?: (id: string, blocked: boolean) => void;
  onWithdraw?: () => void;
  onCancel?: () => void;
}): React.ReactElement {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [committed, setCommitted] = React.useState(false);
  const [submittedFile, setSubmittedFile] = React.useState<File | null>(null);
  const [fileError, setFileError] = React.useState<string>();
  const [preview, setPreview] = React.useState<string>();
  const selectRef = React.useRef<HTMLButtonElement>(null);
  const [state, action, pending] = React.useActionState(async (previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
    const file = form.get("file");
    if (!(file instanceof File)) {
      return { error: DOCUMENT_MESSAGES.file };
    }

    setSubmittedFile(file);

    // A failed detail refresh must not upload the already-saved file again.
    if (!committed) {
      try {
        const result = await mutateDocument(scope, applicationId, "upload", requirement.id, previous, form);
        if (!result.success) {
          return result;
        }
        setCommitted(true);
      } catch {
        return { error: DOCUMENT_MESSAGES.failed };
      }
    }

    try {
      await onSaved();
    } catch {
      return { error: DOCUMENT_MESSAGES.refreshAfterUploadFailed };
    }

    setSelectedFile(null);
    setPreview(undefined);
    setCommitted(false);
    onBlockedChange?.(requirement.id, false);

    return { success: true };
  }, {});
  const showActionError = submittedFile !== null && (selectedFile === null || submittedFile === selectedFile);
  const error = fileError ?? (!pending && showActionError ? state.error : undefined);
  const disabled = pending || externallyDisabled;
  const errorId = `document-upload-error-${requirement.id}`;
  const uploadLabel = autoSave ? "Reintentar" : requirement.canReplace ? "Reemplazar archivo" : "Adjuntar archivo";
  const submitLabel = pending ? "Guardando…" : committed ? "Actualizar detalle" : uploadLabel;

  React.useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  function uploadFile(file: File): void {
    const form = new FormData();
    form.set("file", file);
    React.startTransition(() => action(form));
  }

  function selectFiles(files: File[], silent = false): void {
    if (disabled || committed || files.length === 0) {
      return;
    }

    if (files.length !== 1) {
      if (!silent) {
        setFileError(DOCUMENT_MESSAGES.singleFile);
      }
      return;
    }

    const file = files[0];
    if (!requirement.allowedFormats.includes(file.type) || file.size === 0 || file.size > 10 * 1024 * 1024) {
      if (!silent) {
        setFileError(DOCUMENT_MESSAGES.file);
      }
      return;
    }

    setFileError(undefined);
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    onBlockedChange?.(requirement.id, true);

    if (autoSave) {
      uploadFile(file);
    }
  }

  function removeSelection(): void {
    setSelectedFile(null);
    onBlockedChange?.(requirement.id, false);
    setSubmittedFile(null);
    setPreview(undefined);
    setFileError(undefined);
    selectRef.current?.focus();
  }

  return (
    <form
      action={action}
      onSubmit={(event) => {
        event.preventDefault();
        if (disabled || !selectedFile) {
          return;
        }
        uploadFile(selectedFile);
      }}
      className="space-y-3"
      aria-label={`Adjuntar ${requirement.name}`}
      onDragOver={rejectFileDragOutside}
      onDrop={rejectFileDragOutside}
    >
      <FileDropzone
        accept={requirement.allowedFormats}
        inputLabel={`Archivo para ${requirement.name}`}
        selectLabel={`Seleccionar archivo para ${requirement.name}`}
        title={onCancel ? "Seleccioná el documento recibido" : "Subí tu documento"}
        dragTitle="Soltá tu archivo acá"
        description="Arrastrá tu archivo acá o hacé clic para seleccionarlo."
        buttonRef={selectRef}
        disabled={disabled || committed}
        error={error}
        errorId={errorId}
        onSelectFiles={selectFiles}
      />
      <FieldError id={errorId}>{error}</FieldError>
      {selectedFile ? (
        <>
          <FileUploadSelection
            label="Archivo seleccionado"
            name={selectedFile.name}
            file={selectedFile}
            preview={
              preview ? (
                <DocumentFilePreview key={preview} src={preview} name={selectedFile.name} contentType={selectedFile.type} compact />
              ) : undefined
            }
            previewAction={
              preview ? <DocumentFilePreview src={preview} name={selectedFile.name} contentType={selectedFile.type} iconOnly /> : undefined
            }
            statusLabel={pending ? "Guardando documento…" : committed ? "Guardado; falta actualizar el detalle" : "Sin guardar"}
            removeLabel="Quitar archivo seleccionado"
            disabled={disabled}
            onRemove={committed ? undefined : removeSelection}
          />
          {!autoSave || (!pending && state.error) ? (
            <Button type="submit" size="lg" className="min-h-11 w-full" disabled={disabled}>
              {pending ? <LoaderCircleIcon className="animate-spin" /> : <UploadIcon />}
              {onCancel && !pending && !committed ? "Guardar entrega en nombre del aspirante" : submitLabel}
            </Button>
          ) : null}
        </>
      ) : requirement.currentAttachment && !onCancel ? (
        <DocumentSavedFile
          file={requirement.currentAttachment}
          applicationId={applicationId}
          scope={scope}
          disabled={disabled}
          statusLabel={autoSave ? "Guardado en el borrador" : undefined}
          onWithdraw={onWithdraw}
        />
      ) : null}
      {onCancel ? (
        <Button type="button" variant="outline" size="lg" disabled={pending || committed} onClick={onCancel}>
          Cancelar carga asistida
        </Button>
      ) : null}
    </form>
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
  operation: "review" | "withdraw";
  onClose: () => void;
  onSaved: () => Promise<void>;
}): React.ReactElement {
  const withdrawing = operation === "withdraw";
  const attachment = requirement.currentAttachment;
  const title = withdrawing ? "Retirar entrega" : "Revisar documento";
  const MutationIcon = withdrawing ? ArchiveIcon : FileTextIcon;
  const [state, action, pending] = React.useActionState(async (previous: DocumentActionState, form: FormData): Promise<DocumentActionState> => {
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
