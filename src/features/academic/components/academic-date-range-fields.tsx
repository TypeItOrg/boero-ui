import { useState } from "react";

import { DatePicker } from "@common/components/ui/date-picker";
import type { FormValue } from "@common/types/form-value.types";
import { formatDateInput, parseDateInput } from "@common/utils/date-input.util";
import { FormField } from "@features/academic/components/academic-form-controls";

type ControlledDateRange = {
  endDate: Date | undefined;
  onEndDateChange: (date: Date | undefined) => void;
  onStartDateChange: (date: Date | undefined) => void;
  startDate: Date | undefined;
};

type DateRangeFieldsProps = {
  controlledRange?: ControlledDateRange;
  dateFieldsKey?: React.Key;
  disabled?: boolean;
  endLabel: string;
  endMaxDate?: Date;
  endMinDate?: Date;
  endName: string;
  fieldErrors?: Record<string, string>;
  initialValues: Record<string, FormValue>;
  startLabel: string;
  startMaxDate?: Date;
  startMinDate?: Date;
  startName: string;
};

type DateFormFieldProps = {
  calendarMinDate?: Date;
  date: Date | undefined;
  disabled?: boolean;
  error?: string;
  label: string;
  maxDate?: Date;
  minDate?: Date;
  name: string;
  onChange: (date: Date | undefined) => void;
};

export function DateRangeFields({
  controlledRange,
  dateFieldsKey,
  disabled = false,
  endLabel,
  endMaxDate,
  endMinDate,
  endName,
  fieldErrors,
  initialValues,
  startLabel,
  startMaxDate,
  startMinDate,
  startName,
}: DateRangeFieldsProps): React.ReactElement {
  const [internalStartDate, setInternalStartDate] = useState<Date | undefined>(() =>
    parseInitialDate(initialValues, startName),
  );
  const [internalEndDate, setInternalEndDate] = useState<Date | undefined>(() =>
    parseInitialDate(initialValues, endName),
  );
  const isControlled = controlledRange !== undefined;
  const startDate = isControlled ? controlledRange.startDate : internalStartDate;
  const endDate = isControlled ? controlledRange.endDate : internalEndDate;
  const setStartDate = controlledRange?.onStartDateChange ?? setInternalStartDate;
  const setEndDate = controlledRange?.onEndDateChange ?? setInternalEndDate;
  const hasInvalidRange = startDate !== undefined && endDate !== undefined && endDate < startDate;
  const endDateError = hasInvalidRange ? "La fecha final no puede ser anterior a la inicial." : fieldErrors?.[endName];
  const effectiveEndMinDate = endMinDate ? (startDate ?? endMinDate) : undefined;

  return (
    <div className="flex w-full flex-[1_0_100%] flex-row flex-wrap items-start gap-4">
      <DateFormField
        key={`start-${String(dateFieldsKey)}`}
        label={startLabel}
        name={startName}
        date={startDate}
        onChange={setStartDate}
        disabled={disabled}
        minDate={startMinDate}
        maxDate={startMaxDate}
        error={fieldErrors?.[startName]}
      />
      <DateFormField
        key={`end-${String(dateFieldsKey)}`}
        label={endLabel}
        name={endName}
        date={endDate}
        onChange={setEndDate}
        disabled={disabled}
        minDate={effectiveEndMinDate}
        maxDate={endMaxDate}
        calendarMinDate={startDate ?? endMinDate}
        error={endDateError}
      />
    </div>
  );
}

function DateFormField({
  calendarMinDate,
  date,
  disabled = false,
  error,
  label,
  maxDate,
  minDate,
  name,
  onChange,
}: DateFormFieldProps): React.ReactElement {
  const [draft, setDraft] = useState("");
  const submittedValue = date ? formatDateInput(date) : draft;

  return (
    <FormField label={label} name={name} error={error} className="flex-[1_0_min(200px,100%)]">
      <input type="hidden" name={name} value={submittedValue} />
      <DatePicker
        id={name}
        value={date}
        onChange={onChange}
        onDraftChange={setDraft}
        disabled={disabled}
        minDate={minDate}
        maxDate={maxDate}
        calendarMinDate={calendarMinDate}
        autoComplete="off"
        aria-invalid={Boolean(error)}
      />
    </FormField>
  );
}

export function parseInitialDate(initialValues: Record<string, FormValue>, fieldName: string): Date | undefined {
  return parseDateInput(String(initialValues[fieldName] ?? ""));
}
