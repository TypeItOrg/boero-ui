"use client";

import type { ReactElement } from "react";

import { HistoryIcon } from "lucide-react";

import { Card, CardContent } from "@common/components/ui/card";

import { SECTION_CARD_CLASS_NAME } from "@features/enrollment-applications/components/enrollment-detail-card";
import { EnrollmentStepCardHeader } from "@features/enrollment-applications/components/enrollment-step-card-header";
import type { EnrollmentApplicationResponse } from "@features/enrollment-applications/types/enrollment-application-response.types";
import { formatEnrollmentApplicationDateTime } from "@features/enrollment-applications/utils/enrollment-application-date.util";
import {
  getEnrollmentApplicationStatusLabel,
  isEnrollmentApplicationStatus,
} from "@features/enrollment-applications/utils/enrollment-application-status.util";

export function EnrollmentAdmissionHistory({ application }: { application: EnrollmentApplicationResponse }): ReactElement {
  return (
    <section aria-labelledby="enrollment-admission-history-title">
      <Card className={SECTION_CARD_CLASS_NAME}>
        <EnrollmentStepCardHeader
          icon={HistoryIcon}
          title="Historial de inscripción"
          titleId="enrollment-admission-history-title"
          description="Cambios de estado de la solicitud."
          descriptionBreakpoint="sm"
        />
        <CardContent>
          <ol className="m-0 list-none p-0">
            {application.admissionHistory?.map((event) => (
              <li key={event.id} className="group grid grid-cols-[1rem_minmax(0,1fr)] gap-x-3">
                <div className="relative flex justify-center" aria-hidden="true">
                  <span className="bg-border absolute top-2.5 -bottom-2.5 w-px group-last:hidden" />
                  <span className="bg-muted-foreground relative mt-1.5 size-2 shrink-0 rounded-full" />
                </div>
                <div className="flex min-w-0 flex-col gap-1 pb-5 group-last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <p className="min-w-0 text-sm font-medium break-words">
                    {isEnrollmentApplicationStatus(event.status) ? getEnrollmentApplicationStatusLabel(event.status) : event.status}
                  </p>
                  <time dateTime={event.occurredAt} className="text-muted-foreground shrink-0 text-sm tabular-nums">
                    {formatEnrollmentApplicationDateTime(event.occurredAt)}
                  </time>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </section>
  );
}
