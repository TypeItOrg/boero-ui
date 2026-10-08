"use client";

import { DataTableFilters, type DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import {
  ACADEMIC_ENROLLMENT_STATUS_OPTIONS,
  COURSE_ENROLLMENT_STATUS_OPTIONS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";

type CourseEnrollmentFiltersProps = {
  size: number;
  status?: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
};

export function CourseEnrollmentFilters({ size, status, academicStatus }: CourseEnrollmentFiltersProps): React.ReactElement {
  const selectFilters: DataTableSelectFilter[] = [
    {
      defaultValue: "all",
      label: "Estado",
      name: "status",
      options: [{ value: "all", label: "Todos los estados" }, ...COURSE_ENROLLMENT_STATUS_OPTIONS],
      value: status ?? "all",
    },
    {
      defaultValue: "all",
      label: "Resultado",
      name: "academicStatus",
      options: [{ value: "all", label: "Todos los resultados" }, ...ACADEMIC_ENROLLMENT_STATUS_OPTIONS],
      value: academicStatus ?? "all",
    },
  ];

  return <DataTableFilters selectFilters={selectFilters} size={size} />;
}
