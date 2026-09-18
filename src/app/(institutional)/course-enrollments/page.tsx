import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@common/components/ui/button";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { fetchInstitutionalCourseEnrollments } from "@features/course-enrollments/services/course-enrollment.service";
import { CourseEnrollmentTable } from "@features/course-enrollments/components/course-enrollment-table";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { GraduationCapIcon } from "lucide-react";

export const metadata: Metadata = { title: "Cursadas" };

export default async function CourseEnrollmentsPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar las cursadas." />;
  }

  const data = await fetchInstitutionalCourseEnrollments(user.institutionId);
  const canCreate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_CREATE);
  const canWithdraw = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_WITHDRAW);
  const canUpdateAcademicStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE);
  const canReadWaitlist = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_WAITLIST_READ);

  return (
    <PlatformPageShell
      title="Cursadas"
      breadcrumb={<InstitutionalBreadcrumb />}
      actions={
        <div className="flex flex-wrap items-center gap-2">
          {canCreate ? (
            <Button asChild size="lg">
              <Link href="/course-enrollments/new">Alta manual</Link>
            </Button>
          ) : null}
          <PlatformPageIcon icon={GraduationCapIcon} />
        </div>
      }
    >
      <CourseEnrollmentTable
        items={data.items}
        emptyMessage="No hay cursadas para mostrar."
        canWithdraw={canWithdraw}
        canUpdateAcademicStatus={canUpdateAcademicStatus}
        canReadWaitlist={canReadWaitlist}
        detailBasePath="/course-enrollments"
      />
    </PlatformPageShell>
  );
}
