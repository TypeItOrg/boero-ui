"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  ClockIcon,
  XCircleIcon,
  BanIcon,
  FileTextIcon,
  UserIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  UsersIcon,
  SlidersIcon,
  ExternalLinkIcon,
  CalendarIcon,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@common/components/ui/card";
import { Badge } from "@common/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import { ENROLLMENT_APPLICATION_STATUS_LABELS, ENROLLMENT_DOCUMENT_TYPE_LABELS } from "../constants/enrollment-application.constants";
import { getAttachmentDownloadUrl } from "../utils/enrollment-application.util";
import type { EnrollmentApplicationResponse, EnrollmentApplicationStatus } from "../types/enrollment-application.types";

interface EnrollmentStatusCardProps {
  application: EnrollmentApplicationResponse;
}

function getStatusBadge(status: EnrollmentApplicationStatus): React.ReactElement {
  switch (status) {
    case "SUBMITTED":
      return (
        <Badge variant="secondary" className="gap-1.5 border-amber-500/30 bg-amber-500/15 px-3 py-1 text-sm text-amber-800 dark:text-amber-300">
          <ClockIcon className="size-4" />
          {ENROLLMENT_APPLICATION_STATUS_LABELS.SUBMITTED}
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge variant="success" className="gap-1.5 px-3 py-1 text-sm">
          <CheckCircle2Icon className="size-4" />
          {ENROLLMENT_APPLICATION_STATUS_LABELS.APPROVED}
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge variant="destructive" className="gap-1.5 px-3 py-1 text-sm">
          <XCircleIcon className="size-4" />
          {ENROLLMENT_APPLICATION_STATUS_LABELS.REJECTED}
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge variant="outline" className="text-muted-foreground gap-1.5 px-3 py-1 text-sm">
          <BanIcon className="size-4" />
          {ENROLLMENT_APPLICATION_STATUS_LABELS.CANCELLED}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="gap-1.5 px-3 py-1 text-sm">
          {ENROLLMENT_APPLICATION_STATUS_LABELS.DRAFT}
        </Badge>
      );
  }
}

function getStatusAlert(status: EnrollmentApplicationStatus): React.ReactElement | null {
  switch (status) {
    case "SUBMITTED":
      return (
        <Alert className="border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-200">
          <ClockIcon className="size-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="font-semibold">Solicitud en revisión</AlertTitle>
          <AlertDescription>
            Tu solicitud de inscripción ha sido enviada exitosamente. La administración institucional está evaluando los datos y la documentación
            presentada. Te contactaremos ante cualquier novedad o solicitud de subsanación.
          </AlertDescription>
        </Alert>
      );
    case "APPROVED":
      return (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-200">
          <CheckCircle2Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
          <AlertTitle className="font-semibold">¡Solicitud Aprobada!</AlertTitle>
          <AlertDescription>
            Tu postulación ha sido aprobada. Cumplís con todos los requisitos para el ingreso. La institución te indicará los próximos pasos
            administrativos para la confirmación de matrícula.
          </AlertDescription>
        </Alert>
      );
    case "REJECTED":
      return (
        <Alert variant="destructive">
          <XCircleIcon className="size-4" />
          <AlertTitle className="font-semibold">Solicitud no admitida</AlertTitle>
          <AlertDescription>
            Tu solicitud de inscripción ha sido desestimada o rechazada. Para más información o consultas sobre los motivos, por favor comunicate con
            la secretaría académica de la institución.
          </AlertDescription>
        </Alert>
      );
    case "CANCELLED":
      return (
        <Alert variant="default" className="border-muted bg-muted/30">
          <BanIcon className="text-muted-foreground size-4" />
          <AlertTitle className="text-muted-foreground font-semibold">Solicitud Cancelada</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            Esta postulación fue cancelada voluntariamente. Ya no podrá ser editada ni evaluada.
          </AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
}

function formatDateSafe(dateStr?: string): string {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isValid(d) ? format(d, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: es }) : dateStr;
}

export function EnrollmentStatusCard({ application }: EnrollmentStatusCardProps): React.ReactElement {
  const data = application.data || {};
  const personal = data.personalData || {};
  const academic = data.academicBackground || {};
  const health = data.healthInclusion || {};
  const responsible = data.responsible || {};
  const preference = data.preference || {};
  const attachments = data.attachments || [];

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold">Estado de tu Solicitud de Inscripción</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <CalendarIcon className="size-3.5" />
                <span>Última actualización: {formatDateSafe(application.updatedAt)}</span>
              </CardDescription>
            </div>
            <div>{getStatusBadge(application.status)}</div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {getStatusAlert(application.status)}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Datos Personales */}
            <div className="bg-card space-y-3 rounded-lg border p-4">
              <div className="text-foreground flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                <UserIcon className="text-primary size-4" />
                <span>1. Datos Personales y Contacto</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">Nombre completo:</dt>
                  <dd className="text-foreground font-medium">
                    {personal.firstName} {personal.lastName}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">DNI:</dt>
                  <dd className="text-foreground font-medium">{personal.documentNumber || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Fecha de Nacimiento:</dt>
                  <dd className="text-foreground font-medium">{personal.birthDate || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Teléfono:</dt>
                  <dd className="text-foreground font-medium">{personal.phoneNumber || "-"}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Email:</dt>
                  <dd className="text-foreground font-medium">{personal.email || "-"}</dd>
                </div>
              </dl>
            </div>

            {/* Escolaridad de Base */}
            <div className="bg-card space-y-3 rounded-lg border p-4">
              <div className="text-foreground flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                <GraduationCapIcon className="text-primary size-4" />
                <span>2. Escolaridad de Base</span>
              </div>
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Colegio de origen:</dt>
                  <dd className="text-foreground font-medium">{academic.secondarySchool || "-"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Secundario completo:</dt>
                  <dd className="text-foreground font-medium">{academic.secondaryCompleted ? "Sí" : "No"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Año de egreso:</dt>
                  <dd className="text-foreground font-medium">{academic.currentGradeYear || "-"}</dd>
                </div>
                {academic.secondaryDegreeTitle && (
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Título secundario:</dt>
                    <dd className="text-foreground font-medium">{academic.secondaryDegreeTitle}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Salud e Inclusión */}
            <div className="bg-card space-y-3 rounded-lg border p-4">
              <div className="text-foreground flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                <HeartHandshakeIcon className="text-primary size-4" />
                <span>3. Salud e Inclusión</span>
              </div>
              <dl className="space-y-2 text-xs">
                <div>
                  <dt className="text-muted-foreground">¿Requiere ajustes razonables?</dt>
                  <dd className="text-foreground font-medium">
                    {health.receivesReasonableAdjustments ? "Sí, requiere ajustes" : "No requiere ajustes"}
                  </dd>
                </div>
                {health.receivesReasonableAdjustments && health.adjustmentDetails && (
                  <div>
                    <dt className="text-muted-foreground">Detalle de los ajustes:</dt>
                    <dd className="text-foreground bg-muted/40 mt-0.5 rounded-md p-2 font-medium">{health.adjustmentDetails}</dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Responsable / Tutor */}
            <div className="bg-card space-y-3 rounded-lg border p-4">
              <div className="text-foreground flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                <UsersIcon className="text-primary size-4" />
                <span>4. Responsable / Tutor Legal</span>
              </div>
              {responsible.fullName ? (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Nombre completo:</dt>
                    <dd className="text-foreground font-medium">{responsible.fullName}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">DNI:</dt>
                    <dd className="text-foreground font-medium">{responsible.documentNumber || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Teléfono:</dt>
                    <dd className="text-foreground font-medium">{responsible.phoneNumber || "-"}</dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-muted-foreground">Email:</dt>
                    <dd className="text-foreground font-medium">{responsible.email || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ocupación:</dt>
                    <dd className="text-foreground font-medium">{responsible.occupation || "-"}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Nivel de instrucción:</dt>
                    <dd className="text-foreground font-medium">{responsible.educationLevel || "-"}</dd>
                  </div>
                </dl>
              ) : (
                <p className="text-muted-foreground text-xs italic">No se requirió tutor legal (postulante mayor de edad).</p>
              )}
            </div>

            {/* Preferencias */}
            <div className="bg-card space-y-3 rounded-lg border p-4 md:col-span-2">
              <div className="text-foreground flex items-center gap-2 border-b pb-2 text-sm font-semibold">
                <SlidersIcon className="text-primary size-4" />
                <span>5. Preferencias</span>
              </div>
              <dl className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Turno preferente:</dt>
                  <dd className="text-foreground font-medium">
                    {preference.preferredShift === "MORNING"
                      ? "Mañana"
                      : preference.preferredShift === "AFTERNOON"
                        ? "Tarde"
                        : preference.preferredShift === "EVENING"
                          ? "Noche"
                          : preference.preferredShift || "-"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Autorización de uso de imagen:</dt>
                  <dd className="text-foreground font-medium">{preference.allowsImageUse ? "Autorizada" : "No autorizada"}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">¿Estudiante reingresante?</dt>
                  <dd className="text-foreground font-medium">
                    {preference.isReenrolling ? `Sí (Docente previo: ${preference.previousTeacher || "No indicado"})` : "No"}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Documentación Adjunta */}
          <div className="bg-card space-y-3 rounded-lg border p-4">
            <div className="text-foreground flex items-center gap-2 border-b pb-2 text-sm font-semibold">
              <FileTextIcon className="text-primary size-4" />
              <span>6. Documentación Presentada ({attachments.length} archivos)</span>
            </div>

            {attachments.length === 0 ? (
              <p className="text-muted-foreground text-xs italic">No hay archivos adjuntos registrados.</p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {attachments.map((att) => (
                  <div key={att.id} className="bg-muted/30 flex items-center justify-between rounded-md border p-2.5 text-xs">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <FileTextIcon className="text-primary size-4 shrink-0" />
                      <div className="min-w-0">
                        <p className="truncate font-medium">{att.originalFileName}</p>
                        <p className="text-muted-foreground text-[10px]">
                          {ENROLLMENT_DOCUMENT_TYPE_LABELS[att.attachmentType] || att.attachmentType}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-7 shrink-0 px-2 text-xs"
                      onClick={() => window.open(getAttachmentDownloadUrl(application.applicationId, att.id), "_blank")}
                    >
                      <ExternalLinkIcon className="mr-1 size-3" />
                      Ver
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
