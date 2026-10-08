"use client";

import type { ReactElement } from "react";

import { GraduationCapIcon } from "lucide-react";

import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import { SCHOOLING_EDUCATION_LEVEL_LABELS } from "@features/enrollment-applications/constants/enrollment-application.constants";
import type { EnrollmentAcademicBackground } from "@features/enrollment-applications/types/enrollment-academic-background.types";

export function EnrollmentSchoolingSummary({ academic }: { academic: Partial<EnrollmentAcademicBackground> }): ReactElement {
  return (
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
  );
}
