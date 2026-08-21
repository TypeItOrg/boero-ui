import { useState } from "react";

import { YearSelect } from "@common/components/ui/year-select";
import { toOptionalFormString } from "@common/utils/form-value.util";
import { DateRangeFields, parseInitialDate } from "@features/academic/components/academic-date-range-fields";
import { FormField, FormSelect } from "@features/academic/components/academic-form-controls";
import type { AcademicFieldsProps } from "@features/academic/types/academic-fields-props.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { academicYearStatusLabels } from "@features/academic/utils/academic-labels.util";
import { getMaxAcademicYear, MIN_ACADEMIC_YEAR } from "@features/academic/utils/academic-year.util";

const ACADEMIC_YEAR_STATUS_OPTIONS = ACADEMIC_YEAR_STATUS.filter((status) => status !== "CLOSED").map((status) => ({
  value: status,
  label: academicYearStatusLabels[status],
}));

export function AcademicYearFields({ initialValues = {}, fieldErrors }: AcademicFieldsProps): React.ReactElement {
  const initialYear = Number(toOptionalFormString(initialValues.year));
  const initialStatus = toOptionalFormString(initialValues.status);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(Number.isInteger(initialYear) ? initialYear : undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(() => parseInitialDate(initialValues, "startDate"));
  const [endDate, setEndDate] = useState<Date | undefined>(() => parseInitialDate(initialValues, "endDate"));
  const hasSelectedYear = selectedYear !== undefined;
  const yearStart = hasSelectedYear ? new Date(selectedYear, 0, 1) : undefined;
  const yearEnd = hasSelectedYear ? new Date(selectedYear, 11, 31) : undefined;
  const followingYearEnd = hasSelectedYear ? new Date(selectedYear + 1, 11, 31) : undefined;

  function handleYearChange(value: string): void {
    setSelectedYear(Number(value));
    setStartDate(undefined);
    setEndDate(undefined);
  }

  return (
    <>
      <FormField label="Año" name="year" error={fieldErrors?.year} className="flex-[1_0_min(200px,100%)] sm:col-span-2" required>
        <YearSelect
          id="year"
          name="year"
          minYear={MIN_ACADEMIC_YEAR}
          maxYear={getMaxAcademicYear()}
          value={selectedYear === undefined ? undefined : String(selectedYear)}
          onValueChange={handleYearChange}
          ariaInvalid={Boolean(fieldErrors?.year)}
          required
        />
      </FormField>
      {initialStatus ? (
        <FormField label="Estado" name="status" error={fieldErrors?.status} className="flex-[1_0_min(200px,100%)] sm:col-span-2" required>
          <FormSelect name="status" defaultValue={initialStatus} options={ACADEMIC_YEAR_STATUS_OPTIONS} />
        </FormField>
      ) : null}
      <DateRangeFields
        startLabel="Fecha de inicio"
        startName="startDate"
        endLabel="Fecha de finalización"
        endName="endDate"
        initialValues={initialValues}
        controlledRange={{ startDate, endDate, onStartDateChange: setStartDate, onEndDateChange: setEndDate }}
        fieldErrors={fieldErrors}
        disabled={!hasSelectedYear}
        dateFieldsKey={selectedYear}
        startMinDate={yearStart}
        startMaxDate={yearEnd}
        endMinDate={yearStart}
        endMaxDate={followingYearEnd}
      />
    </>
  );
}
