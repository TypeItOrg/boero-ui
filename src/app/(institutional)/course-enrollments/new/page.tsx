import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ClipboardPlusIcon } from "lucide-react";

import { CourseManualEnrollmentForm } from "@features/course-enrollments/components/course-manual-enrollment-form";
import { fetchActiveCourses, fetchStudents } from "@features/course-enrollments/services/course-enrollment.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Alta manual de cursada");
}

export default async function NewCourseEnrollmentPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_CREATE)) {
    return <InstitutionalAccessDenied description="No tenés permisos para registrar cursadas manualmente." />;
  }

  const [students, courses] = await Promise.all([fetchStudents(user.institutionId, { size: 100 }), fetchActiveCourses(user.institutionId)]);

  if (!students || !courses) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Alta manual de cursada"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ new: "Alta manual" }} />}
      actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}
    >
      <CourseManualEnrollmentForm students={students.items} courses={courses} returnTo="/course-enrollments" />
    </PlatformPageShell>
  );
}
