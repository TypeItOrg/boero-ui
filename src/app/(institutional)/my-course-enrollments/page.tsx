import type { ReactElement } from "react";

import type { Metadata } from "next";

import { GraduationCapIcon } from "lucide-react";

import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";

import { MySubjects } from "@features/course-enrollments/components/my-subjects";
import { fetchMyCourseEnrollments } from "@features/course-enrollments/services/course-enrollment.service";
import { COURSE_ENROLLMENT_STATUS } from "@features/course-enrollments/types/course-enrollment-status.types";
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

export const metadata: Metadata = { title: "Mis materias" };

export default async function MyCourseEnrollmentsPage({
  searchParams,
}: {
  searchParams: Promise<CourseEnrollmentSearchParams>;
}): Promise<ReactElement> {
  const user = await requireInstitutionalUser();
  const resolvedSearchParams = await searchParams;
  const parsed = parseCourseEnrollmentPaginationParams(resolvedSearchParams);
  const { page, size } = parsed;
  const status = parsed.status ?? COURSE_ENROLLMENT_STATUS.ENROLLED;
  const academicStatus = status === COURSE_ENROLLMENT_STATUS.ENROLLED ? undefined : parsed.academicStatus;
  const data = await fetchMyCourseEnrollments(user.institutionId, {
    page,
    size,
    status,
    academicStatus,
  });
  const canWithdraw = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_WITHDRAW);
  const canUpdateAcademicStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE);

  return (
    <PlatformPageShell title="Mis materias" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={GraduationCapIcon} />}>
      <DataTableNavigationProvider>
        <MySubjects
          data={data}
          page={page}
          size={size}
          status={status}
          academicStatus={academicStatus}
          canWithdraw={canWithdraw}
          canUpdateAcademicStatus={canUpdateAcademicStatus}
        />
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
