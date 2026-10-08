"use client";

import { useState, type ReactElement } from "react";

import { useRouter } from "next/navigation";

import { SearchIcon } from "lucide-react";
import { ScrollTextIcon } from "lucide-react";

import { DataTableEmptyStateActions } from "@common/components/ui/data-table-empty-state-actions";
import { useDataTableNavigation } from "@common/components/ui/data-table-navigation";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@common/components/ui/empty";
import { DATA_TABLE_EMPTY_MESSAGES } from "@common/constants/data-table-empty.constants";
import type { PaginatedResponse } from "@common/types/paginated-response.types";

import { CourseEnrollmentMutationDialog } from "@features/course-enrollments/components/course-enrollment-mutation-dialog";
import { CourseEnrollmentPagination } from "@features/course-enrollments/components/course-enrollment-pagination";
import { CourseEnrollmentResultsTable } from "@features/course-enrollments/components/course-enrollment-results-table";
import type { AcademicEnrollmentStatus } from "@features/course-enrollments/types/academic-enrollment-status.types";
import type { CourseEnrollmentStatus } from "@features/course-enrollments/types/course-enrollment-status.types";
import type { CourseEnrollment } from "@features/course-enrollments/types/course-enrollment.types";

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
  canReadWaitlist?: boolean;
  detailBasePath?: string;
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
  canReadWaitlist = false,
  detailBasePath,
}: CourseEnrollmentTableProps): ReactElement {
  const router = useRouter();
  const { isPending: isNavigating, navigate } = useDataTableNavigation();

  const [mutation, setMutation] = useState<{
    enrollment: CourseEnrollment;
    mode: "withdraw" | "academic";
  }>();

  const hasFilters = status !== undefined || academicStatus !== undefined;
  const hasItemsOnOtherPages = data.totalItems > 0;
  const EmptyIcon = hasFilters && !hasItemsOnOtherPages ? SearchIcon : ScrollTextIcon;
  const showActionsColumn = Boolean(detailBasePath) || canReadWaitlist || canWithdraw || canUpdateAcademicStatus;

  if (data.items.length === 0) {
    return (
      <div className="flex h-full flex-col gap-4">
        <div className="relative flex flex-1 overflow-hidden rounded-lg border" aria-busy={isNavigating}>
          <Empty className="min-h-56 p-6">
            <EmptyHeader className="max-w-sm">
              <EmptyMedia variant="icon">
                <EmptyIcon className="size-5" aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle className="text-base">
                {hasItemsOnOtherPages ? "No hay cursadas en esta página" : hasFilters ? "No se encontraron cursadas" : emptyMessage}
              </EmptyTitle>
              <EmptyDescription>
                {hasItemsOnOtherPages
                  ? DATA_TABLE_EMPTY_MESSAGES.PAGE_DESCRIPTION
                  : hasFilters
                    ? DATA_TABLE_EMPTY_MESSAGES.FILTERED_DESCRIPTION
                    : "Las cursadas registradas van a aparecer acá junto con sus horarios, estado y resultado académico."}
              </EmptyDescription>
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
          canReadWaitlist={canReadWaitlist}
          detailBasePath={detailBasePath}
          setMutation={setMutation}
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
