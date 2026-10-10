import type { ReactElement } from "react";

import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ClipboardListIcon } from "lucide-react";

import { CourseWaitlistTable } from "@features/course-enrollments/components/course-waitlist-table";
import { fetchPlatformCourseWaitlist } from "@features/course-enrollments/services/course-enrollment.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export const metadata: Metadata = { title: "Lista de espera" };

export default async function PlatformCourseWaitlistPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ institutionId?: string }>;
}): Promise<ReactElement> {
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
      breadcrumb={
        <PlatformBreadcrumb
          hiddenSegments={[courseId]}
          segmentLabels={{ "course-enrollments": "Cursos" }}
          segmentHrefs={{ "course-enrollments": "/admin/courses" }}
        />
      }
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      <CourseWaitlistTable entries={entries} institutionId={institutionId} scope="admin" canEnroll />
    </PlatformPageShell>
  );
}
