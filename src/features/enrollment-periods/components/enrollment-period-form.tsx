"use client";

import type { ReactElement } from "react";

import Link from "next/link";

import { CircleAlertIcon } from "lucide-react";

import { ActionForm } from "@common/components/action-form";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { Button } from "@common/components/ui/button";

import { EnrollmentPeriodDetailsFields } from "@features/enrollment-periods/components/enrollment-period-details-fields";
import { EnrollmentPeriodOfferings } from "@features/enrollment-periods/components/enrollment-period-offerings";
import { useEnrollmentPeriodForm } from "@features/enrollment-periods/hooks/use-enrollment-period-form";
import type { EnrollmentPeriodFormProps } from "@features/enrollment-periods/types/enrollment-period-form-props.types";

export function EnrollmentPeriodForm(props: EnrollmentPeriodFormProps): ReactElement {
  return <EnrollmentPeriodFormView key={`${props.scope}:${props.initialInstitution?.id}:${props.period?.id ?? "new"}`} {...props} />;
}

function EnrollmentPeriodFormView(props: EnrollmentPeriodFormProps): ReactElement {
  const { period, returnTo, scope } = props;

  const {
    institution,
    academicYear,
    offerings,
    isEdit,
    state,
    formAction,
    isPending,
    formRef,
    fetchAcademicYears,
    startDate,
    startTime,
    endDate,
    endTime,
    changeInstitution,
    changeAcademicYear,
    setOfferings,
    changeStartDate,
    changeStartTime,
    changeEndDate,
    changeEndTime,
  } = useEnrollmentPeriodForm(props);

  const actionLabel = isEdit ? "Guardar cambios" : "Crear período";

  return (
    <ActionForm ref={formRef} action={formAction} className="flex h-full min-h-0 w-full flex-1 flex-col">
      <input type="hidden" name="institutionId" value={institution?.id ?? ""} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-x-hidden overflow-y-auto pb-4">
        {state.error ? (
          <Alert variant="destructive">
            <CircleAlertIcon />
            <AlertTitle>{isEdit ? "No se pudo actualizar el período" : "No se pudo crear el período"}</AlertTitle>
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        ) : null}

        <EnrollmentPeriodDetailsFields
          scope={scope}
          institution={institution}
          onInstitutionChange={changeInstitution}
          onAcademicYearChange={changeAcademicYear}
          isEdit={isEdit}
          academicYear={academicYear}
          fetchAcademicYears={fetchAcademicYears}
          period={period}
          startDate={startDate}
          startTime={startTime}
          onStartDateChange={changeStartDate}
          onStartTimeChange={changeStartTime}
          endDate={endDate}
          endTime={endTime}
          onEndDateChange={changeEndDate}
          onEndTimeChange={changeEndTime}
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
          {isPending ? "Guardando…" : actionLabel}
        </Button>
      </div>
    </ActionForm>
  );
}
