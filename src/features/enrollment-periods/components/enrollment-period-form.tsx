"use client";

import { EnrollmentPeriodOfferings } from "@features/enrollment-periods/components/enrollment-period-offerings";
import type { EnrollmentPeriodOffering } from "@features/enrollment-periods/types/enrollment-period-offering.types";
import { ActionForm } from "@common/components/action-form";

import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarRangeIcon, CircleAlertIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { Button } from "@common/components/ui/button";
import { DatePicker } from "@common/components/ui/date-picker";
import { FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { TimeInputWithIcon } from "@common/components/ui/time-input-with-icon";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import { cn } from "@common/utils/cn.util";
import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";
import { fetchAcademicOptionPage } from "@features/academic/services/academic-options.service";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { ENROLLMENT_MESSAGES } from "@features/enrollment-applications/constants/enrollment-messages.constants";
import { createEnrollmentPeriodAction, updateEnrollmentPeriodAction } from "@features/enrollment-periods/actions/enrollment-period.actions";
import type { EnrollmentPeriodActionState } from "@features/enrollment-periods/types/enrollment-period-action-state.types";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { getEnrollmentPeriodDateTimeInput } from "@features/enrollment-periods/utils/enrollment-period-date.util";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

type EnrollmentPeriodFormProps = {
  initialInstitution?: { id: string; name: string };
  period?: EnrollmentPeriod;
  returnTo: string;
  scope: AcademicScope;
};

export function EnrollmentPeriodForm({ initialInstitution, period, returnTo, scope }: EnrollmentPeriodFormProps): React.ReactElement {
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

        <section className="bg-muted/25 @container/enrollment-period-form rounded-xl border p-5 @md/enrollment-period-form:p-6">
          <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
            <div className="flex items-center gap-3.5">
              <div className="bg-primary/10 text-primary flex aspect-square min-h-11 min-w-11 shrink-0 items-center justify-center self-stretch rounded-xl">
                <CalendarRangeIcon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Información del período</h2>
                <p className="text-muted-foreground text-sm">
                  {AcademicScope.isAdmin(scope)
                    ? "Definí la institución, el ciclo lectivo y las fechas habilitadas para inscribirse."
                    : "Definí el ciclo lectivo y las fechas habilitadas para inscribirse."}
                </p>
              </div>
            </div>
          </header>

          <div className="mt-5 grid gap-5 @2xl/enrollment-period-form:grid-cols-2">
            {AcademicScope.isAdmin(scope) ? (
              <div className="grid min-w-0 gap-2">
                <FieldLabel htmlFor="institutionId" required>
                  Institución
                </FieldLabel>
                <AsyncDropdown<InstitutionSummary>
                  id="institutionId"
                  aria-required="true"
                  value={institution?.id}
                  selectedLabel={institution?.name}
                  fetchPage={fetchPlatformInstitutionOptions}
                  queryKey={["enrollment-period-create-institutions"]}
                  getItemValue={(item) => item.id}
                  getItemLabel={(item) => item.name}
                  onValueChange={(_value, item) => {
                    setInstitution(item ? { id: item.id, name: item.name } : undefined);
                    setAcademicYear(undefined);
                    setOfferings([]);
                  }}
                  placeholder="Seleccionar institución"
                  searchPlaceholder="Buscar institución…"
                  disabled={isEdit}
                />
              </div>
            ) : null}

            <div className={cn("grid min-w-0 gap-2", !AcademicScope.isAdmin(scope) && "@2xl/enrollment-period-form:col-span-2")}>
              <FieldLabel htmlFor="academicYearId" required>
                Ciclo lectivo
              </FieldLabel>
              <input type="hidden" name="academicYearId" value={academicYear?.id ?? ""} />
              <AsyncDropdown<AcademicYear>
                id="academicYearId"
                aria-required="true"
                value={academicYear?.id}
                selectedLabel={academicYear ? `Ciclo ${academicYear.year}` : undefined}
                fetchPage={fetchAcademicYears}
                queryKey={["enrollment-period-create-academic-years", scope, institution?.id]}
                getItemValue={(item) => item.id}
                getItemLabel={(item) => `Ciclo ${item.year}`}
                onValueChange={(_value, item) => setAcademicYear(item ? { id: item.id, year: item.year } : undefined)}
                placeholder={institution ? "Seleccionar ciclo" : "Seleccioná una institución primero"}
                searchPlaceholder="Buscar ciclo lectivo…"
                disabled={!institution || isEdit}
              />
            </div>

            <div className="grid gap-2 @2xl/enrollment-period-form:col-span-2">
              <FieldLabel htmlFor="name" required>
                Nombre del período
              </FieldLabel>
              <Input id="name" name="name" defaultValue={period?.name} placeholder="Ej. Inscripción 2027 · Primer llamado" required />
            </div>

            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="startDate" required>
                Fecha y hora de inicio
              </FieldLabel>
              <input type="hidden" name="startDate" value={formatDateInput(startDate)} />
              <input type="hidden" name="startTime" value={startTime} />
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 *:min-w-0">
                <DatePicker id="startDate" value={startDate} onChange={setStartDate} required autoComplete="off" />
                <TimeInputWithIcon id="startTime" aria-label="Hora de inicio" value={startTime} onValueChange={setStartTime} required />
              </div>
            </div>

            <div className="grid min-w-0 gap-2">
              <FieldLabel htmlFor="endDate" required>
                Fecha y hora de fin
              </FieldLabel>
              <input type="hidden" name="endDate" value={formatDateInput(endDate)} />
              <input type="hidden" name="endTime" value={endTime} />
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] gap-2 *:min-w-0">
                <DatePicker
                  id="endDate"
                  value={endDate}
                  onChange={setEndDate}
                  required
                  minDate={startDate}
                  calendarMinDate={startDate}
                  autoComplete="off"
                />
                <TimeInputWithIcon id="endTime" aria-label="Hora de fin" value={endTime} onValueChange={setEndTime} required />
              </div>
            </div>
          </div>
        </section>
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
