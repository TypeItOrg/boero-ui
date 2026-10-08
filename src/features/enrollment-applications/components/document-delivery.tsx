"use client";

import type { ReactElement } from "react";

import { CircleAlertIcon, DownloadIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentFilePreview } from "@features/enrollment-applications/components/document-file-preview";
import { DOCUMENT_STATUS_LABELS } from "@features/enrollment-applications/constants/documentation.constants";
import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";

export function Delivery({
  file,
  applicationId,
  scope,
  showReviewStatus = false,
}: {
  file: DocumentDelivery;
  applicationId: string;
  scope: AcademicScope;
  showReviewStatus?: boolean;
}): ReactElement {
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
