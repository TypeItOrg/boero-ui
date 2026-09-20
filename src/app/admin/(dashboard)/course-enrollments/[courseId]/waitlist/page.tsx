import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { fetchPlatformCourseWaitlist } from "@features/course-enrollments/services/course-enrollment.service";
import { CourseWaitlistTable } from "@features/course-enrollments/components/course-waitlist-table";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { ClipboardListIcon } from "lucide-react";

export const metadata: Metadata = { title: "Lista de espera" };

export default async function PlatformCourseWaitlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ institutionId?: string }>;
}): Promise<React.ReactElement> {
  await requirePlatformAccount();
  const [{ courseId }, { institutionId }] = await Promise.all([params, searchParams]);

  if (!institutionId) {
    notFound();
  }

  const entries = await fetchPlatformCourseWaitlist(institutionId, courseId);

  if (!entries) {
    notFound();
  }

  return (
    <PlatformPageShell
      title="Lista de espera"
      breadcrumb={<PlatformBreadcrumb hiddenSegments={[courseId]} trailingLabel="Lista de espera" />}
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      <CourseWaitlistTable entries={entries} institutionId={institutionId} scope="admin" canEnroll />
    </PlatformPageShell>
  );
}
