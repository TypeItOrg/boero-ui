"use client";

import type { ReactElement } from "react";

import { UsersRoundIcon } from "lucide-react";

import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import type { EnrollmentResponsible } from "@features/enrollment-applications/types/enrollment-responsible.types";

export function EnrollmentResponsibleSummary({ responsible }: { responsible: Partial<EnrollmentResponsible> }): ReactElement {
  return (
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
  );
}
