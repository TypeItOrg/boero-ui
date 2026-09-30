"use client";

import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { EnrollmentDocuments } from "@features/enrollment-applications/components/enrollment-documents";

import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import * as React from "react";
import { format, isValid } from "date-fns";
import {
  BanIcon,
  CheckCircle2Icon,
  ClipboardCheckIcon,
  ClockIcon,
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
import { OptionalValue } from "@common/components/optional-value";
import { Badge } from "@common/components/ui/badge";
import { Card, CardContent, CardHeader } from "@common/components/ui/card";
import { cn } from "@common/utils/cn.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import { EnrollmentApplicationCoursesManagement } from "@features/enrollment-applications/components/enrollment-application-courses-management";
import {
  ENROLLMENT_APPLICATION_STATUS_LABELS,
  SCHOOLING_EDUCATION_LEVEL_LABELS,
} from "@features/enrollment-applications/constants/enrollment-application.constants";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import {
  ENROLLMENT_APPLICATION_STATUS,
  type EnrollmentApplicationStatus,
} from "@features/enrollment-applications/types/enrollment-application-status.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import {
  getEnrollmentApplicationStatusLabel,
  isEnrollmentApplicationStatus,
} from "@features/enrollment-applications/utils/enrollment-application-status.util";

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
  fallback?: string;
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
  if (status === ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED) {
    return (
      <Badge size="lg" variant="outline">
        Admitida provisoriamente
      </Badge>
    );
  }
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
  if (application.status === ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED) {
    return (
      <Alert>
        <ClockIcon />
        <AlertTitle>Admitida provisoriamente</AlertTitle>
        <AlertDescription>Podés continuar con tu incorporación y completar aquí la documentación pendiente.</AlertDescription>
      </Alert>
    );
  }
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
  const spaces = application.spaces || [];
  const canManageApplicationCourses =
    canManageCourses &&
    (application.status === ENROLLMENT_APPLICATION_STATUS.APPROVED || application.status === ENROLLMENT_APPLICATION_STATUS.PROVISIONALLY_APPROVED);

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

      {canManageApplicationCourses ? (
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

      {application.courses && application.courses.length > 0 && !canManageApplicationCourses ? (
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

      {application.admissionHistory?.length ? (
        <section className="space-y-3 rounded-xl border p-5">
          <h2 className="font-semibold">Historial de inscripción</h2>
          {application.admissionHistory.map((event) => (
            <p key={event.id} className="text-sm">
              {isEnrollmentApplicationStatus(event.status) ? getEnrollmentApplicationStatusLabel(event.status) : event.status} ·{" "}
              {formatEnrollmentApplicationDateTime(event.occurredAt)}
            </p>
          ))}
        </section>
      ) : null}
      <div className="grid gap-4 xl:grid-cols-2">
        <DetailCard icon={UserRoundIcon} title="Datos personales y contacto" description="Información registrada al enviar la solicitud.">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Nombre completo"
              value={`${personal.firstName || ""} ${personal.lastName || ""}`.trim()}
              fallback="Sin nombre registrado"
            />
            <DetailItem label="Documento" value={personal.documentNumber} fallback="Sin documento" />
            <DetailItem label="Fecha de nacimiento" value={formatBusinessDate(personal.birthDate)} fallback="Sin fecha de nacimiento" />
            <DetailItem label="Teléfono" value={personal.phoneNumber} fallback="Sin teléfono" />
            <DetailItem className="sm:col-span-2" label="Correo electrónico" value={personal.email} fallback="Sin correo electrónico" />
          </dl>
        </DetailCard>

        <DetailCard icon={GraduationCapIcon} title="Escolaridad" description="Antecedentes educativos informados.">
          <dl className="grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Asiste actualmente"
              value={academic.currentlyStudying == null ? null : academic.currentlyStudying ? "Sí" : "No"}
              fallback="Asistencia no informada"
            />
            <DetailItem
              label={academic.currentlyStudying == null ? "Nivel educativo" : academic.currentlyStudying ? "Nivel actual" : "Máximo nivel alcanzado"}
              value={academic.educationLevel ? SCHOOLING_EDUCATION_LEVEL_LABELS[academic.educationLevel] : null}
              fallback="Nivel no informado"
            />
            {academic.educationLevel !== "NO_SCHOOLING" || academic.schoolOrigin ? (
              <DetailItem
                className="sm:col-span-2"
                label={
                  academic.currentlyStudying == null
                    ? "Institución educativa"
                    : academic.currentlyStudying
                      ? "Institución educativa actual"
                      : "Última institución educativa"
                }
                value={academic.schoolOrigin}
                fallback="Institución no informada"
              />
            ) : null}
            {academic.currentGradeYear ? <DetailItem label="Sala, grado o año" value={academic.currentGradeYear} /> : null}
            {academic.levelCompleted !== null && academic.levelCompleted !== undefined ? (
              <DetailItem label="Nivel completado" value={academic.levelCompleted ? "Sí" : "No"} />
            ) : null}
            {academic.secondaryCompleted !== null && academic.secondaryCompleted !== undefined ? (
              <DetailItem label="Secundario completo" value={academic.secondaryCompleted ? "Sí" : "No"} />
            ) : null}
            {academic.secondaryDegreeTitle ? (
              <DetailItem className="sm:col-span-2" label="Título secundario obtenido" value={academic.secondaryDegreeTitle} />
            ) : null}
          </dl>
        </DetailCard>

        <DetailCard icon={HeartHandshakeIcon} title="Salud e inclusión" description="Necesidades de acompañamiento declaradas.">
          <dl className="grid gap-4">
            <DetailItem
              label="Ajustes razonables"
              value={
                health.receivesReasonableAdjustments ? (
                  "Sí, requiere ajustes"
                ) : (
                  <span className="text-muted-foreground font-normal italic">No requiere ajustes</span>
                )
              }
            />
            {health.receivesReasonableAdjustments ? (
              <DetailItem label="Detalle" value={health.adjustmentDetails} fallback="Sin detalle de ajustes" />
            ) : null}
          </dl>
        </DetailCard>
        <DetailCard icon={UsersRoundIcon} title="Responsable o tutor legal" description="Información del responsable, cuando corresponde.">
          {responsible.fullName ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailItem className="sm:col-span-2" label="Nombre completo" value={responsible.fullName} />
              <DetailItem label="Documento" value={responsible.documentNumber} fallback="Sin documento" />
              <DetailItem label="Teléfono" value={responsible.phoneNumber} fallback="Sin teléfono" />
              <DetailItem className="sm:col-span-2" label="Correo electrónico" value={responsible.email} fallback="Sin correo electrónico" />
              <DetailItem label="Ocupación" value={responsible.occupation} fallback="Sin ocupación informada" />
              <DetailItem label="Nivel de instrucción" value={responsible.educationLevel} fallback="Sin nivel de instrucción informado" />
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
              <DetailItem label="Trayecto formativo" value={application.trainingPathName} fallback="Sin trayecto formativo" />
              <DetailItem
                label="Plan de estudio"
                value={application.studyPlanName ? formatStudyPlanName(application) : null}
                fallback="Sin plan de estudio"
              />
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
            <DetailItem label="Turno preferente" value={preference.preferredShift} fallback="Sin preferencia de turno" />
            <DetailItem label="Uso de imagen" value={preference.allowsImageUse ? "Autorizado" : "No autorizado"} />
            <DetailItem label="Estudiante reingresante" value={preference.isReenrolling ? "Sí" : "No"} />
            {preference.isReenrolling ? (
              <DetailItem
                className="sm:col-span-3"
                label="Docente anterior"
                value={preference.previousTeacher}
                fallback="Sin docente anterior informado"
              />
            ) : null}
          </dl>
        </DetailCard>

        <div className="xl:col-span-2">
          <EnrollmentDocuments key={application.updatedAt} application={application} scope={scope} />
        </div>
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

function DetailItem({ className, label, value, fallback = "Sin información" }: DetailItemProps): React.ReactElement {
  return (
    <div className={cn("min-w-0 space-y-1", className)}>
      <dt className={DETAIL_LABEL_CLASS_NAME}>{label}</dt>
      <dd className="text-foreground text-sm font-medium break-words">
        <OptionalValue value={value} fallback={fallback} />
      </dd>
    </div>
  );
}

function formatBusinessDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  return isValid(date) ? format(date, "dd/MM/yyyy") : value;
}
