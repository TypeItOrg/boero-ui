"use client";

import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { EnrollmentApplicationStatus } from "../types/enrollment-application-status.types";
import { ENROLLMENT_APPLICATION_STATUS_OPTIONS } from "../constants/enrollment-application.constants";

const ALL_STATUSES = "all";
const ALL_TRAINING_PATHS = "all";
const OPEN_ONLY = "true";
const ALL_PERIODS = "all";

type EnrollmentApplicationFiltersProps = {
  size: number;
  status?: EnrollmentApplicationStatus;
  trainingPathId?: string;
  open?: boolean;
  trainingPaths?: readonly TrainingPath[];
};

export function EnrollmentApplicationFilters({
  size,
  status,
  trainingPathId,
  open,
  trainingPaths,
}: EnrollmentApplicationFiltersProps): React.ReactElement {
  const statusFilter: DataTableSelectFilter = {
    defaultValue: ALL_STATUSES,
    label: "Estado",
    name: "status",
    options: [...ENROLLMENT_APPLICATION_STATUS_OPTIONS],
    value: status ?? ALL_STATUSES,
  };

  const selectFilters: DataTableSelectFilter[] = [statusFilter];

  if (trainingPaths) {
    selectFilters.push({
      defaultValue: ALL_TRAINING_PATHS,
      label: "Trayecto formativo",
      name: "trainingPathId",
      options: [
        { label: "Todos los trayectos", value: ALL_TRAINING_PATHS },
        ...trainingPaths.map((trainingPath) => ({ label: trainingPath.name, value: trainingPath.id })),
      ],
      value: trainingPathId ?? ALL_TRAINING_PATHS,
    });

    selectFilters.push({
      defaultValue: ALL_PERIODS,
      label: "Período de inscripción",
      name: "open",
      options: [
        { label: "Todos los períodos", value: ALL_PERIODS },
        { label: "Solo períodos abiertos", value: OPEN_ONLY },
      ],
      value: open ? OPEN_ONLY : ALL_PERIODS,
    });
  }

  return <DataTableFilters selectFilters={selectFilters} size={size} />;
}
