"use client";

import { useActionState, useCallback, useState } from "react";

import { useRouter } from "next/navigation";

import { useActionFormErrorFocus } from "@common/hooks/use-action-form-error-focus";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { parseDateInput } from "@common/utils/date-input.util";

import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { createEnrollmentPeriodAction, updateEnrollmentPeriodAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import type { EnrollmentPeriodFormProps } from "@features/enrollment-periods/types/enrollment-period-form-props.types";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";
import { getEnrollmentPeriodDateTimeInput } from "@features/enrollment-periods/utils/enrollment-period-date.util";

export function useEnrollmentPeriodForm({ initialInstitution, period, returnTo, scope }: EnrollmentPeriodFormProps) {
  const router = useRouter();
  const isEdit = period !== undefined;

  const [context, setContext] = useState(() => ({
    institution: initialInstitution,
    academicYear: period ? { id: period.academicYearId, year: period.academicYearNumber } : undefined,
    offerings: period?.offerings ?? [],
  }));

  const [dates, setDates] = useState(() => {
    const start = period ? getEnrollmentPeriodDateTimeInput(period.startDate) : undefined;
    const end = period ? getEnrollmentPeriodDateTimeInput(period.endDate) : undefined;

    return { start: { date: start?.date, time: start?.time ?? "" }, end: { date: end?.date, time: end?.time ?? "" } };
  });

  const { institution, academicYear, offerings } = context;

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

  const formRef = useActionFormErrorFocus(state, isPending);

  function changeInstitution(value: typeof institution): void {
    if (value?.id === institution?.id) {
      return;
    }

    setContext({ institution: value, academicYear: undefined, offerings: [] });
  }

  function changeAcademicYear(value: typeof academicYear): void {
    setContext((previous) => ({ ...previous, academicYear: value }));
  }

  function setOfferings(value: EnrollmentPeriodOffering[]): void {
    setContext((previous) => ({ ...previous, offerings: value }));
  }

  function changeStartDate(date: Date | undefined): void {
    setDates((previous) => ({ ...previous, start: { ...previous.start, date } }));
  }

  function changeStartTime(time: string): void {
    setDates((previous) => ({ ...previous, start: { ...previous.start, time } }));
  }

  function changeEndDate(date: Date | undefined): void {
    setDates((previous) => ({ ...previous, end: { ...previous.end, date } }));
  }

  function changeEndTime(time: string): void {
    setDates((previous) => ({ ...previous, end: { ...previous.end, time } }));
  }

  return {
    institution,
    academicYear,
    offerings,
    isEdit,
    state,
    formAction,
    isPending,
    formRef,
    fetchAcademicYears,
    startDate: dates.start.date,
    startTime: dates.start.time,
    endDate: dates.end.date,
    endTime: dates.end.time,
    changeInstitution,
    changeAcademicYear,
    setOfferings,
    changeStartDate,
    changeStartTime,
    changeEndDate,
    changeEndTime,
  };
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
