import { appendReturnTo } from "@common/utils/return-to.util";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Button } from "@common/components/ui/button";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { CourseEnrollmentFilters } from "@features/course-enrollments/components/course-enrollment-filters";
import { CourseEnrollmentTable } from "@features/course-enrollments/components/course-enrollment-table";
import { CourseEnrollmentTableSkeleton } from "@features/course-enrollments/components/course-enrollment-table-skeleton";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchInstitutionalCourseEnrollments } from "@features/course-enrollments/services/course-enrollment.service";
import {
  parseCourseEnrollmentPaginationParams,
  type CourseEnrollmentSearchParams,
} from "@features/course-enrollments/utils/course-enrollment-pagination.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { GraduationCapIcon } from "lucide-react";

export const metadata: Metadata = { title: "Cursadas" };

export default async function CourseEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<CourseEnrollmentSearchParams>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar las cursadas." />;
  }

  const resolvedSearchParams = await searchParams;
  const originParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    for (const entry of Array.isArray(value) ? value : [value]) {
      if (entry !== undefined) {
        originParams.append(key, entry);
      }
    }
  }
  const returnTo = `/course-enrollments${originParams.size ? `?${originParams}` : ""}`;
  const { page, size, status, academicStatus } = parseCourseEnrollmentPaginationParams(resolvedSearchParams);
  const data = await fetchInstitutionalCourseEnrollments(user.institutionId, { page, size, status, academicStatus });
  const canCreate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_CREATE);
  const canWithdraw = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_WITHDRAW);
  const canUpdateAcademicStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE);
  const canReadWaitlist = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_WAITLIST_READ);

  return (
    <PlatformPageShell title="Cursadas" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={GraduationCapIcon} />}>
      {canCreate ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild size="lg">
            <Link href={appendReturnTo("/course-enrollments/new", returnTo)}>Alta manual</Link>
          </Button>
        </div>
      ) : null}
      <DataTableNavigationProvider>
        <CourseEnrollmentFilters size={size} status={status} academicStatus={academicStatus} />
        <Suspense fallback={<CourseEnrollmentTableSkeleton />}>
          <CourseEnrollmentTable
            permissionScopes={user.permissionScopes}
            data={data}
            page={page}
            size={size}
            status={status}
            academicStatus={academicStatus}
            emptyMessage="No hay cursadas para mostrar."
            canWithdraw={canWithdraw}
            canUpdateAcademicStatus={canUpdateAcademicStatus}
            canReadWaitlist={canReadWaitlist}
            detailBasePath="/course-enrollments"
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
