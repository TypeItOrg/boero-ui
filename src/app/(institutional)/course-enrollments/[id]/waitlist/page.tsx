import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { fetchCourseWaitlist } from "@features/course-enrollments/services/course-enrollment.service";
import { CourseWaitlistTable } from "@features/course-enrollments/components/course-waitlist-table";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { ClipboardListIcon } from "lucide-react";

export const metadata: Metadata = { title: "Lista de espera" };

export default async function CourseWaitlistPage({ params }: { params: Promise<{ id: string }> }): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const { id } = await params;
  const entries = await fetchCourseWaitlist(user.institutionId, id);

  if (!entries) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Lista de espera"
      breadcrumb={<InstitutionalBreadcrumb hiddenSegments={[id]} trailingLabel="Lista de espera" />}
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      <CourseWaitlistTable
        entries={entries}
        canEnroll={hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_COURSE_ENROLL)}
      />
    </PlatformPageShell>
  );
}
