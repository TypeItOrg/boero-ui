import type { Metadata } from "next";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { ClipboardPlusIcon } from "lucide-react";

import { CourseManualEnrollmentForm } from "@features/course-enrollments/components/course-manual-enrollment-form";
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

export default async function NewCourseEnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.COURSE_ENROLLMENT_CREATE)) {
    return <InstitutionalAccessDenied description="No tenés permisos para registrar cursadas manualmente." />;
  }

  const returnTo = getSafeReturnTo((await searchParams).returnTo, "/course-enrollments");

  return (
    <PlatformPageShell
      title="Alta manual de cursada"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ new: "Alta manual" }} />}
      actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}
    >
      <CourseManualEnrollmentForm returnTo={returnTo} />
    </PlatformPageShell>
  );
}
