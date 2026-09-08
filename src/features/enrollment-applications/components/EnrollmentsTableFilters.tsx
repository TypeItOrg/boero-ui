"use client";

import * as React from "react";
import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import { ENROLLMENT_APPLICATION_STATUS_OPTIONS } from "../constants/enrollment-application.constants";

export interface EnrollmentPeriodOption {
  id: string;
  name: string;
}

interface EnrollmentsTableFiltersProps {
  search?: string;
  size?: number;
  status?: string;
  periodId?: string;
  enrollmentPeriods?: EnrollmentPeriodOption[];
}

const ALL_OPTION = "all";

export function EnrollmentsTableFilters({
  search,
  size,
  status,
  periodId,
  enrollmentPeriods = [],
}: EnrollmentsTableFiltersProps): React.ReactElement {
  const statusFilter: DataTableSelectFilter = {
    defaultValue: ALL_OPTION,
    label: "Estado",
    name: "status",
    options: ENROLLMENT_APPLICATION_STATUS_OPTIONS,
    value: status ?? ALL_OPTION,
  };

  const periodFilter: DataTableSelectFilter = {
    defaultValue: ALL_OPTION,
    label: "Período de inscripción",
    name: "periodId",
    options: [{ value: ALL_OPTION, label: "Todos los períodos" }, ...enrollmentPeriods.map((period) => ({ value: period.id, label: period.name }))],
    value: periodId ?? ALL_OPTION,
  };

  return (
    <DataTableFilters
      search={search}
      searchPlaceholder="Buscar por nombre, apellido o documento..."
      selectFilters={[statusFilter, periodFilter]}
      size={size}
    />
  );
}
