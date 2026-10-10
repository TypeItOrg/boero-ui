"use client";

import { useState, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { BookOpenIcon, SearchIcon } from "lucide-react";

import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { cn } from "@common/utils/cn.util";

import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { MySubjectsSection } from "@features/course-enrollments/components/my-subjects-section";
import { MY_SUBJECTS_MESSAGES } from "@features/course-enrollments/constants/my-subjects.constants";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import { COURSE_ENROLLMENT_STATUS, type CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

type MySubjectsProps = {
  data: PaginatedResponse<CourseEnrollment>;
  page: number;
  size: number;
  status: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
  canWithdraw: boolean;
  canUpdateAcademicStatus: boolean;
};

export function MySubjects({ data, page, size, status, academicStatus, canWithdraw, canUpdateAcademicStatus }: MySubjectsProps): ReactElement {
  const router = useRouter();

  const { isPending, navigate } = useDataTableNavigation();

  const [mutation, setMutation] = useState<{
    enrollment: CourseEnrollment;
    mode: "withdraw" | "academic";
  }>();

  const isHistory = status !== COURSE_ENROLLMENT_STATUS.ENROLLED;

  const hasFilters = isHistory && (status !== COURSE_ENROLLMENT_STATUS.COMPLETED || academicStatus !== undefined);

  const hasItemsOnOtherPages = data.totalItems > 0;

  const EmptyIcon = hasFilters && !hasItemsOnOtherPages ? SearchIcon : BookOpenIcon;

  const view = isHistory ? "history" : "current";

  function changeView(value: string): void {
    navigate({
      status: value === "history" ? COURSE_ENROLLMENT_STATUS.COMPLETED : undefined,
      academicStatus: undefined,
      page: "0",
    });
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
      <MySubjectsSection
        key={view}
        view={view}
        isHistory={isHistory}
        isPending={isPending}
        size={size}
        status={status}
        academicStatus={academicStatus}
        data={data}
        canWithdraw={canWithdraw}
        canUpdateAcademicStatus={canUpdateAcademicStatus}
        setMutation={setMutation}
        EmptyIcon={EmptyIcon}
        hasItemsOnOtherPages={hasItemsOnOtherPages}
        hasFilters={hasFilters}
        navigate={navigate}
        page={page}
      />
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
