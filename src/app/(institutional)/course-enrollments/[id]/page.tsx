import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ScrollTextIcon } from "lucide-react";

import { getSafeReturnTo } from "@common/utils/return-to.util";
import { CourseEnrollmentDetailActions } from "@features/course-enrollments/components/course-enrollment-detail-actions";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission, hasTrainingPathPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { CourseEnrollmentDetail } from "@features/course-enrollments/components/course-enrollment-detail";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { fetchCourseEnrollment, fetchCourseEnrollmentHistory } from "@features/course-enrollments/services/course-enrollment.service";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = { title: "Detalle de cursada" };

export default async function CourseEnrollmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar las cursadas." />;
  }

  const { id } = await params;
  const returnTo = getSafeReturnTo((await searchParams).returnTo, "/course-enrollments");
  const [enrollment, history] = await Promise.all([
    fetchCourseEnrollment(user.institutionId, id),
    fetchCourseEnrollmentHistory(user.institutionId, id),
  ]);

  if (!enrollment) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Detalle de cursada"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [id]: "Detalle de cursada" }} />}
      actions={<PlatformPageIcon icon={ScrollTextIcon} />}
    >
      <CourseEnrollmentDetailActions
        enrollment={enrollment}
        returnTo={returnTo}
        canWithdraw={hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_WITHDRAW, enrollment.trainingPathId)}
        canUpdateAcademicStatus={hasTrainingPathPermission(
          user,
          INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_ACADEMIC_STATUS_UPDATE,
          enrollment.trainingPathId,
        )}
        canReadWaitlist={hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.COURSE_WAITLIST_READ, enrollment.trainingPathId)}
      />
      <CourseEnrollmentDetail enrollment={enrollment} history={history} />
    </PlatformPageShell>
  );
}
