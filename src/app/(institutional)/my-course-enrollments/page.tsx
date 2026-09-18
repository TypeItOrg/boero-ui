import type { Metadata } from "next";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchMyCourseEnrollments } from "@features/course-enrollments/services/course-enrollment.service";
import { CourseEnrollmentTable } from "@features/course-enrollments/components/course-enrollment-table";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { GraduationCapIcon } from "lucide-react";

export const metadata: Metadata = { title: "Mis cursadas" };

export default async function MyCourseEnrollmentsPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const data = await fetchMyCourseEnrollments(user.institutionId);
  const canWithdraw = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_WITHDRAW);
  const canUpdateAcademicStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE);

  return (
    <PlatformPageShell title="Mis cursadas" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={GraduationCapIcon} />}>
      <CourseEnrollmentTable
        items={data.items}
        emptyMessage="Todavía no tenés cursadas registradas."
        canWithdraw={canWithdraw}
        canUpdateAcademicStatus={canUpdateAcademicStatus}
      />
    </PlatformPageShell>
  );
}
