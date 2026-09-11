"use client";

import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { ENROLLMENT_APPLICATION_STATUS_OPTIONS } from "../constants/enrollment-application.constants";

const ALL_STATUSES = "all";

type EnrollmentApplicationFiltersProps = {
  size: number;
  status?: EnrollmentApplicationStatus;
};

export function EnrollmentApplicationFilters({ size, status }: EnrollmentApplicationFiltersProps): React.ReactElement {
  const statusFilter: DataTableSelectFilter = {
    defaultValue: ALL_STATUSES,
    label: "Estado",
    name: "status",
    options: [...ENROLLMENT_APPLICATION_STATUS_OPTIONS],
    value: status ?? ALL_STATUSES,
  };

  return <DataTableFilters selectFilters={[statusFilter]} size={size} />;
}
