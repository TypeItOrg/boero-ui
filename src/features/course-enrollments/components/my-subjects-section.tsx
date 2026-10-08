"use client";

import type { Dispatch, ForwardRefExoticComponent, ReactElement, RefAttributes, SetStateAction } from "react";

import type { LucideProps } from "lucide-react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { DataTableFilters } from "@common/components/ui/data-table-filters";
import type { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { cn } from "@common/utils/cn.util";
import { getDataTableEmptyContent } from "@common/utils/data-table-empty-content.util";

import { MySubjectCard } from "@features/course-enrollments/components/my-subject-card";
import { MySubjectsSkeleton } from "@features/course-enrollments/components/my-subjects-skeleton";
import {
  ACADEMIC_ENROLLMENT_STATUS_OPTIONS,
  COURSE_ENROLLMENT_STATUS_OPTIONS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import { MY_SUBJECTS_MESSAGES } from "@features/course-enrollments/constants/my-subjects.constants";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import { COURSE_ENROLLMENT_STATUS, type CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS } from "@features/course-enrollments/utils/course-enrollment-pagination.util";

export function MySubjectsSection({
  view,
  isHistory,
  isPending,
  size,
  status,
  academicStatus,
  data,
  canWithdraw,
  canUpdateAcademicStatus,
  setMutation,
  EmptyIcon,
  hasItemsOnOtherPages,
  hasFilters,
  navigate,
  page,
}: {
  view: "history" | "current";
  isHistory: boolean;
  isPending: boolean;
  size: number;
  status: CourseEnrollmentStatus;
  academicStatus: AcademicEnrollmentStatus | undefined;
  data: PaginatedResponse<CourseEnrollment>;
  canWithdraw: boolean;
  canUpdateAcademicStatus: boolean;
  setMutation: Dispatch<SetStateAction<{ enrollment: CourseEnrollment; mode: "withdraw" | "academic" } | undefined>>;
  EmptyIcon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
  hasItemsOnOtherPages: boolean;
  hasFilters: boolean;
  navigate: ReturnType<typeof useDataTableNavigation>["navigate"];
  page: number;
}): ReactElement {
  const emptyContent = getDataTableEmptyContent({
    hasItemsOnOtherPages,
    hasFilters,
    pageTitle: "No hay materias en esta página",
    filteredTitle: "No se encontraron materias",
    emptyTitle: isHistory ? MY_SUBJECTS_MESSAGES.EMPTY_HISTORY : MY_SUBJECTS_MESSAGES.EMPTY_CURRENT,
    emptyDescription: isHistory ? MY_SUBJECTS_MESSAGES.EMPTY_HISTORY_DESCRIPTION : MY_SUBJECTS_MESSAGES.EMPTY_CURRENT_DESCRIPTION,
  });

  function renderContent(): ReactElement | null {
    if (isPending) {
      return <MySubjectsSkeleton />;
    }

    if (data.items.length > 0) {
      return (
        <div
          className={cn("grid gap-4", data.items.length > 1 && "@4xl/page-shell:grid-cols-2", data.items.length > 2 && "@7xl/page-shell:grid-cols-3")}
        >
          {data.items.map((enrollment) => (
            <MySubjectCard
              key={enrollment.id}
              enrollment={enrollment}
              canWithdraw={canWithdraw && !isPending}
              canUpdateAcademicStatus={canUpdateAcademicStatus && !isPending}
              onMutation={(selected, mode) => setMutation({ enrollment: selected, mode })}
            />
          ))}
        </div>
      );
    }

    return (
      <Empty className="bg-muted/25 min-h-56 flex-1 rounded-lg border border-solid px-4 py-12">
        <EmptyHeader className="max-w-md">
          <EmptyMedia variant="icon">
            <EmptyIcon className="size-5" aria-hidden="true" />
          </EmptyMedia>
          <EmptyTitle className="mt-2 text-base">{emptyContent.title}</EmptyTitle>
          <EmptyDescription>{emptyContent.description}</EmptyDescription>
        </EmptyHeader>
        <DataTableEmptyStateActions hasFilters={hasFilters} hasItemsOnOtherPages={hasItemsOnOtherPages} onFirstPage={() => navigate({ page: "0" })} />
      </Empty>
    );
  }

  return (
    <section key={view} aria-label={isHistory ? "Historial" : "En curso"} className="flex min-h-0 flex-1 flex-col gap-5" aria-busy={isPending}>
      {isHistory ? (
        <DataTableFilters
          size={size}
          selectFilters={[
            {
              name: "status",
              label: "Mostrar",
              defaultValue: "all",
              value: status,
              options: COURSE_ENROLLMENT_STATUS_OPTIONS.filter((option) => option.value !== COURSE_ENROLLMENT_STATUS.ENROLLED).map((option) => ({
                ...option,
                label: option.value === COURSE_ENROLLMENT_STATUS.COMPLETED ? "Materias finalizadas" : option.label,
              })),
            },
            {
              name: "academicStatus",
              label: "Resultado académico",
              defaultValue: "all",
              value: academicStatus ?? "all",
              options: [{ value: "all", label: "Todos los resultados" }, ...ACADEMIC_ENROLLMENT_STATUS_OPTIONS],
            },
          ]}
        />
      ) : null}
      {renderContent()}
      {data.totalPages > 1 || page > 0 || size !== COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS[0] ? (
        <DataTablePagination
          page={page}
          size={size}
          totalPages={data.totalPages}
          summaryLabel={`${data.totalItems} ${data.totalItems === 1 ? "materia" : "materias"}`}
          pageSizeLabel="Materias por página"
          pageSizeCompactLabel="Materias"
          pageSizeOptions={COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS}
          isPending={isPending}
          onPageChange={(nextPage) => navigate({ page: String(nextPage) })}
          onPageSizeChange={(nextSize) => navigate({ size: String(nextSize), page: "0" })}
        />
      ) : null}
    </section>
  );
}
