"use client";

import type { ReactElement } from "react";

import { GraduationCapIcon } from "lucide-react";

import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import { SCHOOLING_EDUCATION_LEVEL_LABELS } from "@features/enrollment-applications/constants/enrollment-application.constants";
import type { EnrollmentAcademicBackground } from "@features/enrollment-applications/types/enrollment-academic-background.types";

export function EnrollmentSchoolingSummary({ academic }: { academic: Partial<EnrollmentAcademicBackground> }): ReactElement {
  const schooling = getSchoolingLabels(academic.currentlyStudying);

  return (
    <DetailCard icon={GraduationCapIcon} title="Escolaridad" description="Antecedentes educativos informados.">
      <dl className="grid gap-4 sm:grid-cols-2">
        <DetailItem label="Asiste actualmente" value={schooling.attendance} fallback="Asistencia no informada" />
        <DetailItem
          label={schooling.level}
          value={academic.educationLevel ? SCHOOLING_EDUCATION_LEVEL_LABELS[academic.educationLevel] : null}
          fallback="Nivel no informado"
        />
        {academic.educationLevel !== "NO_SCHOOLING" || academic.schoolOrigin ? (
          <DetailItem label={schooling.institution} value={academic.schoolOrigin} fallback="Institución no informada" />
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
  );
}

function getSchoolingLabels(currentlyStudying: boolean | null | undefined): { attendance: string | null; level: string; institution: string } {
  if (currentlyStudying == null) {
    return { attendance: null, level: "Nivel educativo", institution: "Institución educativa" };
  }

  if (currentlyStudying) {
    return { attendance: "Sí", level: "Nivel actual", institution: "Institución educativa actual" };
  }

  return { attendance: "No", level: "Máximo nivel alcanzado", institution: "Última institución educativa" };
}
