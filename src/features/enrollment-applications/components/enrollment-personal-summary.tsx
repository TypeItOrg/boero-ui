"use client";

import type { ReactElement } from "react";

import { UserRoundIcon } from "lucide-react";

import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import type { EnrollmentPersonalData } from "@features/enrollment-applications/types/enrollment-personal-data.types";
import { formatBusinessDate } from "@features/enrollment-applications/utils/enrollment-business-date.util";

export function EnrollmentPersonalSummary({ personal }: { personal: Partial<EnrollmentPersonalData> }): ReactElement {
  return (
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
  );
}
