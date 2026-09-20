import type { Metadata } from "next";
import { Suspense } from "react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { CourseEnrollmentFilters } from "@features/course-enrollments/components/course-enrollment-filters";
import { CourseEnrollmentTable } from "@features/course-enrollments/components/course-enrollment-table";
import { CourseEnrollmentTableSkeleton } from "@features/course-enrollments/components/course-enrollment-table-skeleton";
import { fetchMyCourseEnrollments } from "@features/course-enrollments/services/course-enrollment.service";
import {
  parseCourseEnrollmentPaginationParams,
  type CourseEnrollmentSearchParams,
} from "@features/course-enrollments/utils/course-enrollment-pagination.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { GraduationCapIcon } from "lucide-react";

export const metadata: Metadata = { title: "Mis cursadas" };

export default async function MyCourseEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<CourseEnrollmentSearchParams>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const resolvedSearchParams = await searchParams;
  const { page, size, status, academicStatus } = parseCourseEnrollmentPaginationParams(resolvedSearchParams);
  const data = await fetchMyCourseEnrollments(user.institutionId, { page, size, status, academicStatus });
  const canWithdraw = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_WITHDRAW);
  const canUpdateAcademicStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE);

  return (
    <PlatformPageShell title="Mis cursadas" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={GraduationCapIcon} />}>
      <DataTableNavigationProvider>
        <CourseEnrollmentFilters size={size} status={status} academicStatus={academicStatus} />
        <Suspense fallback={<CourseEnrollmentTableSkeleton />}>
          <CourseEnrollmentTable
            data={data}
            page={page}
            size={size}
            status={status}
            academicStatus={academicStatus}
            emptyMessage="Todavía no tenés cursadas registradas."
            canWithdraw={canWithdraw}
            canUpdateAcademicStatus={canUpdateAcademicStatus}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
