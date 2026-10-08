"use client";

import type { ReactElement, ReactNode } from "react";

import { FileUploadSelection } from "@common/components/ui/file-upload-selection";

import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { DocumentFilePreview } from "@features/enrollment-applications/components/document-file-preview";
import type { DocumentDelivery } from "@features/enrollment-applications/types/document-delivery.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";

export function DocumentSavedFile({
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
  secondaryActions?: ReactNode;
  primaryAction?: ReactNode;
  onWithdraw?: () => void;
}): ReactElement {
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
