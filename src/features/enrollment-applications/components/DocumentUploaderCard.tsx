"use client";

import * as React from "react";
import { UploadCloudIcon, Loader2Icon, CheckCircle2Icon, Trash2Icon, ExternalLinkIcon, AlertCircleIcon, FileTextIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@common/components/ui/card";
import { Button } from "@common/components/ui/button";
import { Alert, AlertDescription } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { uploadEnrollmentAttachmentAction, deleteEnrollmentAttachmentAction } from "../actions/enrollment-application.actions";
import { getAttachmentDownloadUrl } from "../utils/enrollment-application.util";
import type { EnrollmentAttachment, EnrollmentDocumentType } from "../types/enrollment-application.types";

interface DocumentUploaderCardProps {
  applicationId: string;
  documentType: EnrollmentDocumentType;
  title: string;
  description: string;
  required?: boolean;
  attachment?: EnrollmentAttachment | null;
  onUploadSuccess: (attachment: EnrollmentAttachment) => void;
  onDeleteSuccess: (documentType: EnrollmentDocumentType, attachmentId: string) => void;
  readOnly?: boolean;
}

function formatFileSize(bytes?: number): string {
  if (!bytes || bytes === 0) return "";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function DocumentUploaderCard({
  applicationId,
  documentType,
  title,
  description,
  required = false,
  attachment,
  onUploadSuccess,
  onDeleteSuccess,
  readOnly = false,
}: DocumentUploaderCardProps): React.ReactElement {
  const [isUploading, setIsUploading] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validación de tamaño (máx 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("El archivo supera el límite máximo permitido de 10 MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);
    setError(null);

    // Si es imagen o pdf, crear URL de previsualización local
    const localUrl = URL.createObjectURL(file);
    setPreviewBlobUrl(localUrl);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("attachmentType", documentType);

      const uploaded = await uploadEnrollmentAttachmentAction(applicationId, formData);
      onUploadSuccess({
        ...uploaded,
        url: uploaded.url || localUrl,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al subir el archivo";
      setError(msg);
      setPreviewBlobUrl(null);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async () => {
    if (!attachment?.id || isDeleting || readOnly) return;

    setIsDeleting(true);
    setError(null);

    try {
      await deleteEnrollmentAttachmentAction(applicationId, attachment.id);
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
        setPreviewBlobUrl(null);
      }
      onDeleteSuccess(documentType, attachment.id);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al eliminar el archivo";
      setError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePreview = () => {
    const targetUrl = previewBlobUrl || (attachment ? getAttachmentDownloadUrl(applicationId, attachment.id) : undefined);
    if (targetUrl) {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className="transition-all hover:shadow-xs">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-base font-semibold">
              {title}
              {required && <span className="text-destructive ml-1">*</span>}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {attachment ? (
            <Badge variant="success" className="shrink-0 gap-1">
              <CheckCircle2Icon className="size-3" />
              Cargado
            </Badge>
          ) : required ? (
            <Badge variant="outline" className="text-muted-foreground shrink-0">
              Requerido
            </Badge>
          ) : (
            <Badge variant="ghost" className="text-muted-foreground shrink-0">
              Opcional
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {error && (
          <Alert variant="destructive" className="py-2">
            <AlertCircleIcon className="size-4" />
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {attachment ? (
          <div className="bg-muted/40 flex flex-col gap-3 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-md">
                <FileTextIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium" title={attachment.originalFileName}>
                  {attachment.originalFileName}
                </p>
                {attachment.size && <p className="text-muted-foreground text-xs">{formatFileSize(attachment.size)}</p>}
              </div>
            </div>

            <div className="flex items-center gap-1.5 self-end sm:self-center">
              <Button type="button" variant="outline" size="sm" onClick={handlePreview} className="gap-1.5 text-xs">
                <ExternalLinkIcon className="size-3.5" />
                Ver / Descargar
              </Button>

              {!readOnly && (
                <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting} className="gap-1.5 text-xs">
                  {isDeleting ? <Loader2Icon className="size-3.5 animate-spin" /> : <Trash2Icon className="size-3.5" />}
                  Eliminar
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading || readOnly}
            />

            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading || readOnly}
              className="hover:bg-muted/50 w-full gap-2 border-dashed py-5"
            >
              {isUploading ? (
                <>
                  <Loader2Icon className="text-primary size-4 animate-spin" />
                  <span>Subiendo archivo...</span>
                </>
              ) : (
                <>
                  <UploadCloudIcon className="text-muted-foreground size-4" />
                  <span>Seleccionar archivo (PDF o Imagen)</span>
                </>
              )}
            </Button>
            <p className="text-muted-foreground mt-1.5 text-center text-xs">Formatos soportados: PDF, JPG, PNG (máx. 10 MB)</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
