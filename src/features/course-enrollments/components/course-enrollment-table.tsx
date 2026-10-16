"use client";

import { useState, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { SearchIcon } from "lucide-react";
import { ScrollTextIcon } from "lucide-react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import type { PaginatedResponse } from "@common/types/paginated-response.types";
import { getDataTableEmptyContent } from "@common/utils/data-table-empty-content.util";

import { CourseEnrollmentGradeDialog } from "@features/course-enrollments/components/course-enrollment-grade-dialog";
import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { CourseEnrollmentPagination } from "@features/course-enrollments/components/course-enrollment-pagination";
import { CourseEnrollmentResultsTable } from "@features/course-enrollments/components/course-enrollment-results-table";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";
import { INSTITUTIONAL_PERMISSION as P } from "@features/institutional-auth/types/institutional-permission.types";
import { scopeIncludesTrainingPath } from "@features/institutional-auth/utils/institutional-permission.util";

type CourseEnrollmentTableProps = {
  permissionScopes?: import("@features/institutional-auth/types/institutional-user.types").InstitutionalUser["permissionScopes"];
  data: PaginatedResponse<CourseEnrollment>;
  page: number;
  size: number;
  status?: CourseEnrollmentStatus;
  academicStatus?: AcademicEnrollmentStatus;
  emptyMessage: string;
  canWithdraw?: boolean;
  canUpdateAcademicStatus?: boolean;
  detailBasePath?: string;
  gradeMode?: "institutional" | "teacher";
  canReadGrades?: boolean;
  canCreateGrade?: boolean;
  canUpdateGrade?: boolean;
  canDeleteGrade?: boolean;
};

export function CourseEnrollmentTable({
  data,
  permissionScopes,
  page,
  size,
  status,
  academicStatus,
  emptyMessage,
  canWithdraw = false,
  canUpdateAcademicStatus = false,
  detailBasePath,
  gradeMode,
  canReadGrades = false,
  canCreateGrade = false,
  canUpdateGrade = false,
  canDeleteGrade = false,
}: CourseEnrollmentTableProps): ReactElement {
  const router = useRouter();

  const { isPending: isNavigating, navigate } = useDataTableNavigation();

  const [mutation, setMutation] = useState<{
    enrollment: CourseEnrollment;
    mode: "withdraw" | "academic";
  }>();

  const [gradeEnrollment, setGradeEnrollment] = useState<CourseEnrollment | null>(null);

  const hasFilters = status !== undefined || academicStatus !== undefined;

  const hasItemsOnOtherPages = data.totalItems > 0;

  const EmptyIcon = hasFilters && !hasItemsOnOtherPages ? SearchIcon : ScrollTextIcon;

  const showActionsColumn = Boolean(detailBasePath) || canWithdraw || canUpdateAcademicStatus || canReadGrades;

  if (data.items.length === 0) {
    const emptyContent = getDataTableEmptyContent({
      hasItemsOnOtherPages,
      hasFilters,
      pageTitle: "No hay cursadas en esta página",
      filteredTitle: "No se encontraron cursadas",
      emptyTitle: emptyMessage,
      emptyDescription: "Las cursadas registradas van a aparecer acá junto con sus horarios, estado y resultado académico.",
    });

    return (
      <div className="flex h-full flex-col gap-4">
        <div className="relative flex flex-1 overflow-hidden rounded-lg border" aria-busy={isNavigating}>
          <Empty className="min-h-56 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                <EmptyIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">{emptyContent.title}</EmptyTitle>
              <EmptyDescription>{emptyContent.description}</EmptyDescription>
            </EmptyHeader>
            <DataTableEmptyStateActions
              hasFilters={hasFilters}
              hasItemsOnOtherPages={hasItemsOnOtherPages}
              onFirstPage={() => navigate({ page: "0" })}
            />
          </Empty>
          {isNavigating && (
            <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
              <span className="sr-only" role="status" aria-live="polite">
                Cargando cursadas
              </span>
            </div>
          )}
        </div>

        <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="relative h-full overflow-hidden rounded-lg border" aria-busy={isNavigating}>
        <CourseEnrollmentResultsTable
          showActionsColumn={showActionsColumn}
          data={data}
          canWithdraw={canWithdraw}
          permissionScopes={permissionScopes}
          canUpdateAcademicStatus={canUpdateAcademicStatus}
          detailBasePath={detailBasePath}
          setMutation={setMutation}
          gradeMode={gradeMode}
          canReadGrades={canReadGrades}
          setGradeEnrollment={setGradeEnrollment}
        />

        {isNavigating && (
          <div className="bg-background/55 absolute inset-0 z-20 flex items-center justify-center backdrop-blur-[1px]">
            <span className="sr-only" role="status" aria-live="polite">
              Cargando cursadas
            </span>
          </div>
        )}
      </div>

      <CourseEnrollmentPagination page={page} size={size} totalItems={data.totalItems} totalPages={data.totalPages} />

      {gradeEnrollment && gradeMode ? (
        <CourseEnrollmentGradeDialog
          enrollment={gradeEnrollment}
          mode={gradeMode}
          canCreate={
            gradeMode === "teacher"
              ? canCreateGrade
              : canCreateGrade && scopeIncludesTrainingPath(permissionScopes, P.COURSE_ENROLLMENT_GRADE_CREATE, gradeEnrollment.trainingPathId)
          }
          canUpdate={
            gradeMode === "teacher"
              ? canUpdateGrade
              : canUpdateGrade && scopeIncludesTrainingPath(permissionScopes, P.COURSE_ENROLLMENT_GRADE_UPDATE, gradeEnrollment.trainingPathId)
          }
          canDelete={
            gradeMode === "teacher"
              ? canDeleteGrade
              : canDeleteGrade && scopeIncludesTrainingPath(permissionScopes, P.COURSE_ENROLLMENT_GRADE_DELETE, gradeEnrollment.trainingPathId)
          }
          open
          onOpenChange={(open) => {
            if (!open) {
              setGradeEnrollment(null);
            }
          }}
          onChanged={() => router.refresh()}
        />
      ) : null}
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
