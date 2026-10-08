"use client";

import { useActionState, useCallback, useEffect, useRef, useState, type ReactElement } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { CircleAlertIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { parseDateInput } from "@common/utils/date-input.util";

import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { createEnrollmentPeriodAction, updateEnrollmentPeriodAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import { EnrollmentPeriodDetailsFields } from "@features/enrollment-periods/components/enrollment-period-details-fields";
import { EnrollmentPeriodOfferings } from "@features/enrollment-periods/components/enrollment-period-offerings";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { getEnrollmentPeriodDateTimeInput } from "@features/enrollment-periods/utils/enrollment-period-date.util";

type EnrollmentPeriodFormProps = {
  initialInstitution?: { id: string; name: string };
  period?: EnrollmentPeriod;
  returnTo: string;
  scope: AcademicScope;
};

export function EnrollmentPeriodForm({ initialInstitution, period, returnTo, scope }: EnrollmentPeriodFormProps): ReactElement {
  const router = useRouter();
  const errorRef = useRef<HTMLDivElement>(null);
  const [offerings, setOfferings] = useState<EnrollmentPeriodOffering[]>(period?.offerings ?? []);
  const isEdit = period !== undefined;
  const initialStart = period ? getEnrollmentPeriodDateTimeInput(period.startDate) : undefined;
  const initialEnd = period ? getEnrollmentPeriodDateTimeInput(period.endDate) : undefined;
  const [institution, setInstitution] = useState(initialInstitution);
  const [academicYear, setAcademicYear] = useState<{ id: string; year: number } | undefined>(() =>
    period ? { id: period.academicYearId, year: period.academicYearNumber } : undefined,
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() => initialStart?.date);
  const [startTime, setStartTime] = useState(() => initialStart?.time ?? "");
  const [endDate, setEndDate] = useState<Date | undefined>(() => initialEnd?.date);
  const [endTime, setEndTime] = useState(() => initialEnd?.time ?? "");
  const fetchAcademicYears = useCallback(
    (input: AsyncDropdownFetchPageInput) => {
      if (!institution) {
        return Promise.resolve({ items: [], nextPage: null });
      }

      return fetchAcademicOptionPage<AcademicYear>("academic-years", scope, institution.id, input, {
        active: "all",
        operation: isEdit ? "ENROLLMENT_PERIOD_UPDATE" : "ENROLLMENT_PERIOD_CREATE",
      });
    },
    [institution, scope, isEdit],
  );
  const [state, formAction, isPending] = useActionState(
    async (_previous: EnrollmentPeriodActionState, formData: FormData): Promise<EnrollmentPeriodActionState> => {
      const startDateTime = parseLocalDateTime(formData.get("startDate"), formData.get("startTime"));
      const endDateTime = parseLocalDateTime(formData.get("endDate"), formData.get("endTime"));

      if (!startDateTime || !endDateTime) {
        return { error: ENROLLMENT_MESSAGES.DATE_INPUT_INVALID };
      }

      const institutionId = String(formData.get("institutionId") ?? "");
      const values = {
        offerings: offerings.map((offering) => ({
          studyPlanId: offering.studyPlanId,
          academicLevelIds: offering.academicLevels.map((level) => level.id),
          includeUnassigned: offering.includeUnassigned,
        })),
        name: String(formData.get("name") ?? ""),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
      };
      const result = period
        ? await updateEnrollmentPeriodAction(institutionId, period.id, values, scope)
        : await createEnrollmentPeriodAction(institutionId, { ...values, academicYearId: String(formData.get("academicYearId") ?? "") }, scope);

      if (result.success) {
        router.push(returnTo);
      }

      return result;
    },
    {},
  );

  useEffect(() => {
    if (state.error && !isPending) {
      errorRef.current?.scrollIntoView({ block: "center" });
      errorRef.current?.focus({ preventScroll: true });
    }
  }, [state, isPending]);

  return (
    <ActionForm action={formAction} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <input type="hidden" name="institutionId" value={institution?.id ?? ""} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pb-4">
        {state.error ? (
          <Alert ref={errorRef} tabIndex={-1} variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{isEdit ? "No se pudo actualizar el período" : "No se pudo crear el período"}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <EnrollmentPeriodDetailsFields
          scope={scope}
          institution={institution}
          setInstitution={setInstitution}
          setAcademicYear={setAcademicYear}
          setOfferings={setOfferings}
          isEdit={isEdit}
          academicYear={academicYear}
          fetchAcademicYears={fetchAcademicYears}
          period={period}
          startDate={startDate}
          startTime={startTime}
          setStartDate={setStartDate}
          setStartTime={setStartTime}
          endDate={endDate}
          endTime={endTime}
          setEndDate={setEndDate}
          setEndTime={setEndTime}
        />
        {institution ? (
          <EnrollmentPeriodOfferings
            operation={isEdit ? "ENROLLMENT_PERIOD_UPDATE" : "ENROLLMENT_PERIOD_CREATE"}
            key={institution.id}
            institutionId={institution.id}
            scope={scope}
            value={offerings}
            onChange={setOfferings}
            disabled={isPending}
          />
        ) : null}
      </div>

      <div className="bg-background sticky bottom-0 z-10 mt-auto flex flex-row flex-wrap items-center justify-end gap-3">
        <Button asChild type="button" variant="outline" size="lg" className="flex-1 sm:flex-none">
          <Link href={returnTo}>Cancelar</Link>
        </Button>
        <Button
          type="submit"
          size="lg"
          className="flex-1 sm:flex-none"
          disabled={isPending || !institution || !academicYear || !startDate || !startTime || !endDate || !endTime}
        >
          {isPending ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear período"}
        </Button>
      </div>
    </ActionForm>
  );
}

function parseLocalDateTime(dateValue: FormDataEntryValue | null, timeValue: FormDataEntryValue | null): Date | undefined {
  if (typeof dateValue !== "string" || typeof timeValue !== "string") {
    return undefined;
  }

  const date = parseDateInput(dateValue);
  const time = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(timeValue);

  if (!date || !time) {
    return undefined;
  }

  date.setHours(Number(time[1]), Number(time[2]), 0, 0);

  return date;
}
