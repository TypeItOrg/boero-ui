"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookOpenIcon, SearchIcon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { DataTableFilters } from "@common/components/ui/data-table-filters";
import { DataTablePagination } from "@common/components/ui/data-table-pagination";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { cn } from "@common/utils/cn.util";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { MySubjectsSkeleton } from "@features/course-enrollments/components/my-subjects-skeleton";
import { MySubjectCard } from "@features/course-enrollments/components/my-subject-card";
import {
  ACADEMIC_ENROLLMENT_STATUS_OPTIONS,
  COURSE_ENROLLMENT_STATUS_OPTIONS,
} from "@features/course-enrollments/constants/course-enrollment.constants";
import { MY_SUBJECTS_MESSAGES } from "@features/course-enrollments/constants/my-subjects.constants";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import { COURSE_ENROLLMENT_STATUS, type CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { COURSE_ENROLLMENT_PAGE_SIZE_OPTIONS } from "@features/course-enrollments/utils/course-enrollment-pagination.util";

type MySubjectsProps = {
  data: PaginatedResponse<CourseEnrollment>;
  page: number;
  size: number;
  status: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
  canWithdraw: boolean;
  canUpdateAcademicStatus: boolean;
};

export function MySubjects({ data, page, size, status, academicStatus, canWithdraw, canUpdateAcademicStatus }: MySubjectsProps): React.ReactElement {
  const router = useRouter();
  const { isPending, navigate } = useDataTableNavigation();
  const [mutation, setMutation] = React.useState<{ enrollment: CourseEnrollment; mode: "withdraw" | "academic" }>();
  const isHistory = status !== COURSE_ENROLLMENT_STATUS.ENROLLED;
  const view = isHistory ? "history" : "current";

  function changeView(value: string): void {
    navigate({ status: value === "history" ? COURSE_ENROLLMENT_STATUS.COMPLETED : undefined, academicStatus: undefined, page: "0" });
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Secciones de mis materias" className="w-full max-w-full sm:w-fit">
          <div className="bg-muted text-muted-foreground grid grid-cols-2 items-center gap-1 rounded-lg p-1 text-sm font-medium sm:flex sm:gap-0.5 sm:p-[3px]">
            {[
              { value: "current", title: "En curso" },
              { value: "history", title: "Historial" },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                aria-current={view === tab.value ? "page" : undefined}
                disabled={isPending}
                onClick={() => changeView(tab.value)}
                className={cn(
                  "focus-visible:outline-ring inline-flex min-h-9 items-center justify-center rounded-md px-1 py-1 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:h-[30px] sm:min-h-0 sm:px-2.5 sm:py-0 sm:whitespace-nowrap",
                  view === tab.value ? "bg-background text-foreground shadow-xs" : "hover:text-foreground",
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </nav>
        <p className="text-muted-foreground text-sm">{MY_SUBJECTS_MESSAGES.DESCRIPTION}</p>
      </div>
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
        {isPending ? (
          <MySubjectsSkeleton />
        ) : data.items.length > 0 ? (
          <div
            className={cn(
              "grid gap-4",
              data.items.length > 1 && "@4xl/page-shell:grid-cols-2",
              data.items.length > 2 && "@7xl/page-shell:grid-cols-3",
            )}
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
        ) : (
          <Empty className="bg-muted/25 min-h-56 flex-1 rounded-lg border border-solid px-4 py-12">
            <EmptyHeader className="max-w-md">
              <EmptyMedia variant="icon">
                {isHistory ? <SearchIcon className="size-5" aria-hidden="true" /> : <BookOpenIcon className="size-5" aria-hidden="true" />}
              </EmptyMedia>
              <EmptyTitle className="mt-2 text-base">
                {isHistory ? MY_SUBJECTS_MESSAGES.EMPTY_HISTORY : MY_SUBJECTS_MESSAGES.EMPTY_CURRENT}
              </EmptyTitle>
              <EmptyDescription>
                {isHistory ? MY_SUBJECTS_MESSAGES.EMPTY_HISTORY_DESCRIPTION : MY_SUBJECTS_MESSAGES.EMPTY_CURRENT_DESCRIPTION}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
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
      {mutation ? (
        <CourseEnrollmentMutationDialog
          enrollment={mutation.enrollment}
          mode={mutation.mode}
          open
          onOpenChange={(open) => {
            if (!open) {
              setMutation(undefined);
            }
          }}
          onUpdated={() => router.refresh()}
        />
      ) : null}
    </div>
  );
}
