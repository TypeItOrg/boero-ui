"use client";

import type { ReactElement } from "react";

import { Music2Icon } from "lucide-react";

import { formatStudyPlanName } from "@features/academic/utils/study-plan-label.util";
import { DetailCard, DetailItem } from "@features/enrollment-applications/components/enrollment-detail-card";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import type { EnrollmentApplicationSpaceResponse } from "@features/enrollment-applications/types/enrollment-application-space-response.types";

export function EnrollmentSpacesSummary({
  application,
  spaces,
}: {
  application: EnrollmentApplicationResponse;
  spaces: EnrollmentApplicationSpaceResponse[];
}): ReactElement {
  return (
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
  );
}
