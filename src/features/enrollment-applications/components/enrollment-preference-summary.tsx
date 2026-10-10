"use client";

import type { ReactElement } from "react";

import { SlidersHorizontalIcon } from "lucide-react";

import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import type { EnrollmentPreference } from "@features/enrollment-applications/types/enrollment-preference.types";

export function EnrollmentPreferenceSummary({ preference }: { preference: Partial<EnrollmentPreference> }): ReactElement {
  return (
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
  );
}
