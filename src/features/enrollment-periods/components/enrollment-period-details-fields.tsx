"use client";

import type { ReactElement } from "react";

import { CalendarRangeIcon } from "lucide-react";

import { SectionHeader } from "@common/components/section-header";
import { AsyncDropdown } from "@common/components/ui/async-dropdown";
import { DatePicker } from "@common/components/ui/date-picker";
import { FieldLabel } from "@common/components/ui/field";
import { Input } from "@common/components/ui/input";
import { TimeInputWithIcon } from "@common/components/ui/time-input-with-icon";
import type { AsyncDropdownFetchPageInput } from "@common/types/async-dropdown-fetch-page-input.types";
import type { AsyncDropdownPage } from "@common/types/async-dropdown-page.types";
import { cn } from "@common/utils/cn.util";
import { formatDateInput } from "@common/utils/date-input.util";

import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import type { EnrollmentPeriod } from "@features/enrollment-periods/types/enrollment-period.types";
import { fetchPlatformInstitutionOptions } from "@features/institutions/services/fetch-platform-institution-options.service";
import type { InstitutionSummary } from "@features/institutions/types/institution-summary.types";

export function EnrollmentPeriodDetailsFields({
  scope,
  institution,
  onInstitutionChange,
  onAcademicYearChange,
  isEdit,
  academicYear,
  fetchAcademicYears,
  period,
  startDate,
  startTime,
  onStartDateChange,
  onStartTimeChange,
  endDate,
  endTime,
  onEndDateChange,
  onEndTimeChange,
}: {
  scope: AcademicScope;
  institution: { id: string; name: string } | undefined;
  onInstitutionChange: (value: { id: string; name: string } | undefined) => void;
  onAcademicYearChange: (value: { id: string; year: number } | undefined) => void;
  isEdit: boolean;
  academicYear: { id: string; year: number } | undefined;
  fetchAcademicYears: (input: AsyncDropdownFetchPageInput) => Promise<AsyncDropdownPage<AcademicYear>>;
  period: EnrollmentPeriod | undefined;
  startDate: Date | undefined;
  startTime: string;
  onStartDateChange: (value: Date | undefined) => void;
  onStartTimeChange: (value: string) => void;
  endDate: Date | undefined;
  endTime: string;
  onEndDateChange: (value: Date | undefined) => void;
  onEndTimeChange: (value: string) => void;
}): ReactElement {
  return (
    <section className="bg-muted/25 @container/enrollment-period-form rounded-xl border p-5 @md/enrollment-period-form:p-6">
      <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
        <SectionHeader
          icon={CalendarRangeIcon}
          title="Información del período"
          description={
            AcademicScope.isAdmin(scope)
              ? "Definí la institución, el ciclo lectivo y las fechas habilitadas para inscribirse."
              : "Definí el ciclo lectivo y las fechas habilitadas para inscribirse."
          }
        />
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
                onInstitutionChange(item ? { id: item.id, name: item.name } : undefined);
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
            onValueChange={(_value, item) => onAcademicYearChange(item ? { id: item.id, year: item.year } : undefined)}
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
            <DatePicker id="startDate" value={startDate} onChange={onStartDateChange} required autoComplete="off" />
            <TimeInputWithIcon id="startTime" aria-label="Hora de inicio" value={startTime} onValueChange={onStartTimeChange} required />
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
              onChange={onEndDateChange}
              required
              minDate={startDate}
              calendarMinDate={startDate}
              autoComplete="off"
            />
            <TimeInputWithIcon id="endTime" aria-label="Hora de fin" value={endTime} onValueChange={onEndTimeChange} required />
          </div>
        </div>
      </div>
    </section>
  );
}
