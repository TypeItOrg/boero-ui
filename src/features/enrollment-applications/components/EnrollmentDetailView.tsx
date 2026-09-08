"use client";

import * as React from "react";
import {
  CheckCircle2Icon,
  DownloadIcon,
  FileIcon,
  FileTextIcon,
  GraduationCapIcon,
  HeartHandshakeIcon,
  Settings2Icon,
  UserRoundIcon,
  UsersIcon,
  XCircleIcon,
  type LucideIcon,
} from "lucide-react";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { ENROLLMENT_DOCUMENT_TYPE_LABELS, SHIFT_OPTIONS } from "../constants/enrollment-application.constants";
import type { EnrollmentApplicationData, EnrollmentApplicationResponse, EnrollmentAttachment } from "../types/enrollment-application.types";
import { EnrollmentStatusBadge } from "./EnrollmentStatusBadge";
import {
  formatApplicationDateTime,
  formatBirthDate,
  formatFileSize,
  getApplicantDni,
  getApplicantFullName,
  getAttachmentDownloadUrl,
} from "../utils/enrollment-application.util";

interface EnrollmentDetailViewProps {
  application: EnrollmentApplicationResponse;
  studyPlanName?: string;
  academicYearName?: string;
}

export function EnrollmentDetailView({ application, studyPlanName, academicYearName }: EnrollmentDetailViewProps): React.ReactElement {
  const fullName = getApplicantFullName(application);
  const dni = getApplicantDni(application);
  const requestDate = formatApplicationDateTime(application.submittedAt || application.createdAt);

  const data = (application.data || {}) as EnrollmentApplicationData;
  const personal = data.personalData || {};
  const education = data.educationBackground || {};
  const academic = data.academicBackground || {};
  const health = data.healthInclusion || {};
  const responsible = data.responsible || {};
  const preferences = data.preferences || {};
  const attachments = (data.attachments || []) as EnrollmentAttachment[];

  // Formatted fields
  const secondarySchool = education.secondarySchool || academic.secondarySchool || "—";
  const graduationYear = education.graduationYear || "—";
  const isComplete = education.isSecondaryComplete;
  const secondaryTitle = education.secondaryTitle || "—";

  const requiresSupport = health.requiresSupport;
  const supportDetails = health.supportDetails?.trim() || "";

  const hasResponsible = responsible.fullName || responsible.documentNumber || responsible.phone;

  const shiftLabel = SHIFT_OPTIONS.find((s) => s.value === preferences.preferredShift)?.label || preferences.preferredShift || "—";

  return (
    <div className="flex flex-col gap-6">
      {/* Header Summary & Administrative Actions */}
      <div className="bg-muted/20 flex flex-col gap-4 rounded-xl border p-5 sm:p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">{fullName}</h1>
            <EnrollmentStatusBadge status={application.status} size="lg" />
          </div>
          <p className="text-muted-foreground text-sm">
            DNI: <span className="text-foreground font-medium">{dni}</span>
            <span className="mx-2">•</span>
            Fecha de solicitud: <span className="text-foreground font-medium">{requestDate}</span>
            {studyPlanName && (
              <>
                <span className="mx-2">•</span>
                Plan: <span className="text-foreground font-medium">{studyPlanName}</span>
              </>
            )}
            {academicYearName && (
              <>
                <span className="mx-2">•</span>
                Ciclo: <span className="text-foreground font-medium">{academicYearName}</span>
              </>
            )}
          </p>
        </div>

        {/* Espacio reservado para acciones administrativas futuras */}
        <div className="border-border/60 flex flex-wrap items-center gap-2.5 pt-3 md:border-l md:pt-0 md:pl-6">
          <Button variant="default" disabled className="gap-2 opacity-60 shadow-xs" title="Próximamente disponible">
            <CheckCircle2Icon className="size-4" />
            Aprobar inscripción
          </Button>
          <Button variant="destructive" disabled className="gap-2 opacity-60 shadow-xs" title="Próximamente disponible">
            <XCircleIcon className="size-4" />
            Rechazar
          </Button>
        </div>
      </div>

      {/* Grid de 6 Tarjetas Estilizadas (Patrón ABM del producto) */}
      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* 1. Tarjeta: Datos Personales y de Contacto */}
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
            <DetailSectionHeader
              icon={UserRoundIcon}
              title="Datos Personales y de Contacto"
              description="Información de filiación y medios de comunicación del postulante."
            />
          </header>
          <dl className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2">
            <DetailValue label="Nombre" value={personal.firstName || "—"} />
            <DetailValue label="Apellido" value={personal.lastName || "—"} />
            <DetailValue label="Documento (DNI)" value={personal.documentNumber || "—"} />
            <DetailValue label="Fecha de nacimiento" value={formatBirthDate(personal.birthDate)} />
            <DetailValue label="Domicilio" value={personal.address ? `${personal.address}${personal.city ? `, ${personal.city}` : ""}` : "—"} />
            <DetailValue label="Teléfono" value={personal.phone || "—"} />
            <DetailValue label="Email" value={personal.email || "—"} />
          </dl>
        </section>

        {/* 2. Tarjeta: Trayectoria Educativa */}
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
            <DetailSectionHeader
              icon={GraduationCapIcon}
              title="Trayectoria Educativa"
              description="Antecedentes académicos y nivel de escolaridad previo."
            />
          </header>
          <dl className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2">
            <DetailValue label="Colegio de origen" value={secondarySchool} />
            <DetailValue label="Año de egreso / Curso" value={graduationYear} />
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Secundario completo</dt>
              <dd className="mt-1.5">
                {isComplete !== undefined ? (
                  isComplete ? (
                    <Badge variant="success">Sí, completo</Badge>
                  ) : (
                    <Badge variant="outline">Incompleto / En curso</Badge>
                  )
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </dd>
            </div>
            <DetailValue label="Título obtenido" value={secondaryTitle} />
          </dl>
        </section>

        {/* 3. Tarjeta: Salud e Inclusión */}
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
            <DetailSectionHeader
              icon={HeartHandshakeIcon}
              title="Salud e Inclusión"
              description="Ajustes razonables solicitados y soporte de accesibilidad."
            />
          </header>
          <dl className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-1">
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Ajustes razonables</dt>
              <dd className="mt-1.5">
                {requiresSupport !== undefined ? (
                  requiresSupport ? (
                    <Badge variant="destructive">Requiere ajustes razonables</Badge>
                  ) : (
                    <Badge variant="secondary">No requiere ajustes</Badge>
                  )
                ) : (
                  <span className="text-muted-foreground text-sm">No especificado</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Detalle de accesibilidad</dt>
              <dd className="mt-1 text-sm font-medium">{supportDetails || "Sin requerimientos adicionales declarados."}</dd>
            </div>
          </dl>
        </section>

        {/* 4. Tarjeta: Responsable Legal / Tutor */}
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
            <DetailSectionHeader
              icon={UsersIcon}
              title="Responsable Legal / Tutor"
              description="Datos del adulto a cargo o tutor legal (si corresponde)."
            />
          </header>
          {hasResponsible ? (
            <dl className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2">
              <DetailValue label="Nombre y Apellido" value={responsible.fullName || "—"} />
              <DetailValue label="DNI" value={responsible.documentNumber || "—"} />
              <DetailValue label="Ocupación" value={responsible.occupation || "—"} />
              <DetailValue label="Teléfono" value={responsible.phone || "—"} />
              <DetailValue label="Email" value={responsible.email || "—"} />
              <DetailValue label="Nivel educativo" value={responsible.educationLevel || "—"} />
            </dl>
          ) : (
            <div className="mt-6 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <p className="text-muted-foreground text-sm">No aplica / Postulante mayor de edad.</p>
            </div>
          )}
        </section>

        {/* 5. Tarjeta: Preferencias y Autorizaciones */}
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
            <DetailSectionHeader
              icon={Settings2Icon}
              title="Preferencias y Autorizaciones"
              description="Turno de cursada preferente, permisos y antecedentes institucionales."
            />
          </header>
          <dl className="mt-4 grid gap-4 sm:mt-5 sm:grid-cols-2">
            <DetailValue label="Turno preferente" value={shiftLabel} />
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Uso de imagen</dt>
              <dd className="mt-1.5">
                {preferences.imageAuthorization !== undefined ? (
                  preferences.imageAuthorization ? (
                    <Badge variant="success">Autorizado</Badge>
                  ) : (
                    <Badge variant="outline">No autorizado</Badge>
                  )
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">Condición de ingreso</dt>
              <dd className="mt-1.5">
                {preferences.isReentering !== undefined ? (
                  preferences.isReentering ? (
                    <Badge variant="secondary">Reingresante</Badge>
                  ) : (
                    <Badge variant="outline">Nuevo aspirante</Badge>
                  )
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </dd>
            </div>
            <DetailValue label="Docente previo / Referencia" value={preferences.previousTeacher || "Ninguno"} />
          </dl>
        </section>

        {/* 6. Tarjeta: Documentación Adjunta */}
        <section className="bg-muted/25 rounded-xl border p-4 sm:p-5">
          <header className="-mx-4 border-b px-4 pb-4 sm:-mx-5 sm:px-5 sm:pb-5">
            <DetailSectionHeader
              icon={FileTextIcon}
              title="Documentación Adjunta"
              description="Archivos y constancias presentadas en la inscripción."
            />
          </header>
          <div className="mt-4 sm:mt-5">
            {attachments.length > 0 ? (
              <div className="divide-border/60 divide-y rounded-lg border">
                {attachments.map((attachment) => {
                  const docTypeLabel =
                    ENROLLMENT_DOCUMENT_TYPE_LABELS[attachment.documentType as keyof typeof ENROLLMENT_DOCUMENT_TYPE_LABELS] ||
                    attachment.documentType ||
                    "Documento";
                  const downloadUrl = attachment.url || getAttachmentDownloadUrl(application.applicationId, attachment.id);

                  return (
                    <div key={attachment.id} className="hover:bg-muted/30 flex items-center justify-between gap-3 p-3 transition-colors">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg">
                          <FileIcon className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-medium">{docTypeLabel}</p>
                          <p className="text-muted-foreground truncate text-xs">
                            {attachment.fileName}
                            {attachment.fileSize && (
                              <>
                                <span className="mx-1">•</span>
                                {formatFileSize(attachment.fileSize)}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      <Button asChild variant="outline" size="sm" className="shrink-0 gap-1.5">
                        <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download={attachment.fileName}>
                          <DownloadIcon className="size-3.5" />
                          <span className="hidden sm:inline">Descargar</span>
                        </a>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Empty className="bg-background/50 border border-dashed py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <FileTextIcon className="text-muted-foreground size-5" />
                  </EmptyMedia>
                  <EmptyTitle>Sin documentos adjuntos</EmptyTitle>
                  <EmptyDescription>No se adjuntaron archivos o constancias a esta solicitud de inscripción.</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function DetailSectionHeader({ description, icon: Icon, title }: { description: string; icon: LucideIcon; title: string }): React.ReactElement {
  return (
    <div className="flex items-center gap-3.5">
      <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
    </div>
  );
}

function DetailValue({ label, value }: { label: string; value: string | null }): React.ReactElement {
  return (
    <div>
      <dt className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</dt>
      <dd className="mt-1 text-sm font-medium">{value || "—"}</dd>
    </div>
  );
}
