"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import {
  BanIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ClockIcon,
  ExternalLinkIcon,
  FileTextIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  Music2Icon,
  SlidersHorizontalIcon,
  UserRoundIcon,
  UsersRoundIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardHeader } from "@common/components/ui/card";
import { cn } from "@common/utils/cn.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { EnrollmentApplicationCoursesManagement } from "@features/enrollment-applications/components/enrollment-application-courses-management";
import {
  ENROLLMENT_APPLICATION_STATUS_LABELS,
  ENROLLMENT_DOCUMENT_TYPE_LABELS,
} from "@features/enrollment-applications/constants/enrollment-application.constants";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";
import { getAttachmentDownloadUrl } from "@features/enrollment-applications/utils/enrollment-application.util";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";

interface EnrollmentStatusCardProps {
  application: EnrollmentApplicationResponse;
  showApplicantAlert?: boolean;
  scope?: AcademicScope;
  institutionId?: string;
  canManageCourses?: boolean;
  canEnrollCourses?: boolean;
  canRejectCourses?: boolean;
  canReadCourseWaitlist?: boolean;
}

type DetailItemProps = {
  className?: string;
  label: string;
  value: React.ReactNode;
};

type DetailCardProps = {
  children: React.ReactNode;
  className?: string;
  description: string;
  icon: LucideIcon;
  title: string;
};

const SECTION_CARD_CLASS_NAME = "bg-muted/25 sm:[--card-spacing:--spacing(6)]";

function getStatusBadge(status: EnrollmentApplicationStatus): React.ReactElement {
  if (status === ENROLLMENT_APPLICATION_STATUS.SUBMITTED) {
    return (
      <Badge size="lg" variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300">
        <ClockIcon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.SUBMITTED}
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.APPROVED) {
    return (
      <Badge size="lg" variant="success">
        <CheckCircle2Icon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.APPROVED}
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.REJECTED) {
    return (
      <Badge size="lg" variant="destructive">
        <XCircleIcon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.REJECTED}
      </Badge>
    );
  }

  if (status === ENROLLMENT_APPLICATION_STATUS.CANCELLED) {
    return (
      <Badge size="lg" variant="outline" className="text-muted-foreground">
        <BanIcon />
        {ENROLLMENT_APPLICATION_STATUS_LABELS.CANCELLED}
      </Badge>
    );
  }

  return (
    <Badge size="lg" variant="outline">
      {ENROLLMENT_APPLICATION_STATUS_LABELS.DRAFT}
    </Badge>
  );
}

function getStatusAlert(application: EnrollmentApplicationResponse): React.ReactElement | null {
  if (application.status === ENROLLMENT_APPLICATION_STATUS.SUBMITTED) {
    return (
      <Alert className="bg-card border-amber-500/30 text-amber-800 dark:text-amber-300">
        <ClockIcon />
        <AlertTitle>Solicitud en revisión</AlertTitle>
        <AlertDescription>
          La institución está revisando los datos y la documentación presentada. Te contactará si necesita algo más.
        </AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.APPROVED) {
    return (
      <Alert variant="success">
        <CheckCircle2Icon />
        <AlertTitle>Solicitud aprobada</AlertTitle>
        <AlertDescription>La institución te indicará los próximos pasos para confirmar la matrícula.</AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.REJECTED) {
    return (
      <Alert variant="destructive">
        <XCircleIcon />
        <AlertTitle>Solicitud no admitida</AlertTitle>
        <AlertDescription>{application.rejectionReason || "Contactá a la institución para obtener más información."}</AlertDescription>
      </Alert>
    );
  }

  if (application.status === ENROLLMENT_APPLICATION_STATUS.CANCELLED) {
    return (
      <Alert>
        <BanIcon />
        <AlertTitle>Solicitud cancelada</AlertTitle>
        <AlertDescription>Esta solicitud ya no puede editarse ni ser evaluada.</AlertDescription>
      </Alert>
    );
  }

  return null;
}
export function EnrollmentStatusCard({
  application,
  showApplicantAlert = true,
  scope = AcademicScope.INSTITUTIONAL,
  institutionId,
  canManageCourses = false,
  canEnrollCourses = false,
  canRejectCourses = false,
  canReadCourseWaitlist = false,
}: EnrollmentStatusCardProps): React.ReactElement {
  const data = application.data || {};
  const personal = data.personalData || {};
  const academic = data.academicBackground || {};
  const health = data.healthInclusion || {};
  const responsible = data.responsible || {};
  const preference = data.preference || {};
  const attachments = data.attachments || [];
  const spaces = application.spaces || [];
  const preferredShift = preference.preferredShift || "—";

  return (
    <div className="flex flex-col gap-4">
      <Card className={SECTION_CARD_CLASS_NAME}>
        <CardHeader>
          <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3.5">
            <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
              <ClipboardCheckIcon className="size-5" aria-hidden="true" />
            </div>
            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1.5">
                <h2 className="font-heading text-base leading-snug font-medium text-balance">Estado de la solicitud</h2>
                <div className="@2xl/page-shell:ml-auto">{getStatusBadge(application.status)}</div>
              </div>
              <p className="text-muted-foreground text-sm text-pretty">Actualizada el {formatEnrollmentApplicationDateTime(application.updatedAt)}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {showApplicantAlert ? getStatusAlert(application) : null}

      {canManageCourses && application.status === ENROLLMENT_APPLICATION_STATUS.APPROVED ? (
        <EnrollmentApplicationCoursesManagement
          applicationId={application.applicationId}
          institutionId={institutionId ?? application.institutionId}
          scope={scope}
          courses={application.courses ?? []}
          canEnroll={canEnrollCourses}
          canReject={canRejectCourses}
          canReadWaitlist={canReadCourseWaitlist}
        />
      ) : null}

      {application.courses &&
      application.courses.length > 0 &&
      !(canManageCourses && application.status === ENROLLMENT_APPLICATION_STATUS.APPROVED) ? (
        <EnrollmentApplicationCoursesManagement
          applicationId={application.applicationId}
          institutionId={institutionId ?? application.institutionId}
          scope={scope}
          courses={application.courses}
          canEnroll={false}
          canReject={false}
          canReadWaitlist={canReadCourseWaitlist}
          readOnly
        />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <DetailCard icon={UserRoundIcon} title="Datos personales y contacto" description="Información registrada al enviar la solicitud.">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem label="Nombre completo" value={`${personal.firstName || ""} ${personal.lastName || ""}`.trim() || "—"} />
            <DetailItem label="Documento" value={personal.documentNumber || "—"} />
            <DetailItem label="Fecha de nacimiento" value={formatBusinessDate(personal.birthDate)} />
            <DetailItem label="Teléfono" value={personal.phoneNumber || "—"} />
            <DetailItem className="sm:col-span-2" label="Correo electrónico" value={personal.email || "—"} />
          </dl>
        </DetailCard>

        <DetailCard icon={GraduationCapIcon} title="Escolaridad de base" description="Antecedentes educativos informados.">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem className="sm:col-span-2" label="Colegio de origen" value={academic.secondarySchool || "—"} />
            <DetailItem label="Secundario completo" value={academic.secondaryCompleted ? "Sí" : "No"} />
            <DetailItem label="Año de cursado o egreso" value={academic.currentGradeYear || "—"} />
            <DetailItem className="sm:col-span-2" label="Título o especialidad" value={academic.secondaryDegreeTitle || "—"} />
          </dl>
        </DetailCard>

        <DetailCard icon={HeartHandshakeIcon} title="Salud e inclusión" description="Necesidades de acompañamiento declaradas.">
          <dl className="grid gap-4">
            <DetailItem label="Ajustes razonables" value={health.receivesReasonableAdjustments ? "Sí, requiere ajustes" : "No requiere ajustes"} />
            {health.receivesReasonableAdjustments ? <DetailItem label="Detalle" value={health.adjustmentDetails || "—"} /> : null}
          </dl>
        </DetailCard>
        <DetailCard icon={UsersRoundIcon} title="Responsable o tutor legal" description="Información del responsable, cuando corresponde.">
          {responsible.fullName ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem className="sm:col-span-2" label="Nombre completo" value={responsible.fullName} />
              <DetailItem label="Documento" value={responsible.documentNumber || "—"} />
              <DetailItem label="Teléfono" value={responsible.phoneNumber || "—"} />
              <DetailItem className="sm:col-span-2" label="Correo electrónico" value={responsible.email || "—"} />
              <DetailItem label="Ocupación" value={responsible.occupation || "—"} />
              <DetailItem label="Nivel de instrucción" value={responsible.educationLevel || "—"} />
            </dl>
          ) : (
            <p className="text-muted-foreground text-sm">No se requirió tutor legal porque la persona postulante es mayor de edad.</p>
          )}
        </DetailCard>

        {spaces.length > 0 ? (
          <DetailCard
            className="xl:col-span-2"
            icon={Music2Icon}
            title="Trayecto formativo y espacios académicos"
            description="Trayecto y materias seleccionadas para la inscripción."
          >
            <dl className="mb-5 grid gap-4 sm:grid-cols-2">
              <DetailItem label="Trayecto formativo" value={application.trainingPathName || "—"} />
              <DetailItem label="Plan de estudio" value={application.studyPlanName || "—"} />
            </dl>
            <div className="bg-background divide-y overflow-hidden rounded-xl border">
              {spaces.map((space) => (
                <div key={space.studyPlanSpaceId} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium">{space.spaceName}</p>
                    {space.academicLevelName ? <p className="text-muted-foreground text-sm">{space.academicLevelName}</p> : null}
                  </div>
                  {space.instrumentName ? <p className="text-muted-foreground text-sm">Instrumento: {space.instrumentName}</p> : null}
                </div>
              ))}
            </div>
          </DetailCard>
        ) : null}

        <DetailCard
          className="xl:col-span-2"
          icon={SlidersHorizontalIcon}
          title="Preferencias y consentimientos"
          description="Preferencias declaradas para la cursada."
        >
          <dl className="grid gap-4 sm:grid-cols-3">
            <DetailItem label="Turno preferente" value={preferredShift} />
            <DetailItem label="Uso de imagen" value={preference.allowsImageUse ? "Autorizado" : "No autorizado"} />
            <DetailItem label="Estudiante reingresante" value={preference.isReenrolling ? "Sí" : "No"} />
            {preference.isReenrolling ? (
              <DetailItem className="sm:col-span-3" label="Docente anterior" value={preference.previousTeacher || "—"} />
            ) : null}
          </dl>
        </DetailCard>

        <DetailCard
          className="xl:col-span-2"
          icon={FileTextIcon}
          title="Documentación presentada"
          description={`${attachments.length} ${attachments.length === 1 ? "archivo adjunto" : "archivos adjuntos"}.`}
        >
          {attachments.length > 0 ? (
            <div className="bg-background divide-y overflow-hidden rounded-xl border">
              {attachments.map((attachment) => (
                <div key={attachment.id} className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{attachment.originalFileName}</p>
                    <p className="text-muted-foreground text-sm">
                      {ENROLLMENT_DOCUMENT_TYPE_LABELS[attachment.attachmentType] || attachment.attachmentType}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    className="shrink-0"
                    onClick={() => window.open(getAttachmentDownloadUrl(application.applicationId, attachment.id, scope), "_blank")}
                  >
                    <ExternalLinkIcon />
                    Abrir
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No se adjuntaron documentos.</p>
          )}
        </DetailCard>
      </div>
    </div>
  );
}

function DetailCard({ children, className, description, icon, title }: DetailCardProps): React.ReactElement {
  return (
    <Card className={cn(SECTION_CARD_CLASS_NAME, className)}>
      <EnrollmentStepCardHeader icon={icon} title={title} description={description} />
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function DetailItem({ className, label, value }: DetailItemProps): React.ReactElement {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className="text-muted-foreground text-sm">{label}</dt>
      <dd className="text-foreground text-sm font-medium break-words">{value}</dd>
    </div>
  );
}

function formatBusinessDate(value?: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(`${value}T00:00:00`);

  return isValid(date) ? format(date, "dd/MM/yyyy") : value;
}
