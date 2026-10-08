"use client";

import type { ReactElement } from "react";

import { HeartHandshakeIcon } from "lucide-react";

import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import type { EnrollmentHealthInclusion } from "@features/enrollment-applications/types/enrollment-health-inclusion.types";

export function EnrollmentHealthSummary({ health }: { health: Partial<EnrollmentHealthInclusion> }): ReactElement {
  return (
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
  );
}
