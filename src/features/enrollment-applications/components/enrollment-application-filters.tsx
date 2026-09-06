"use client";

import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { ENROLLMENT_APPLICATION_STATUS_LABEL } from "../utils/enrollment-application-status.util";

const ALL_STATUSES = "all";

const STATUS_FILTER_OPTIONS = (Object.keys(ENROLLMENT_APPLICATION_STATUS_LABEL) as EnrollmentApplicationStatus[]).map((status) => ({
  value: status,
  label: ENROLLMENT_APPLICATION_STATUS_LABEL[status],
}));

type EnrollmentApplicationFiltersProps = {
  size: number;
  status?: EnrollmentApplicationStatus;
};

export function EnrollmentApplicationFilters({ size, status }: EnrollmentApplicationFiltersProps): React.ReactElement {
  const statusFilter: DataTableSelectFilter = {
    defaultValue: ALL_STATUSES,
    label: "Estado",
    name: "status",
    options: [{ value: ALL_STATUSES, label: "Todos los estados" }, ...STATUS_FILTER_OPTIONS],
    value: status ?? ALL_STATUSES,
  };

  return <DataTableFilters selectFilters={[statusFilter]} size={size} />;
}
