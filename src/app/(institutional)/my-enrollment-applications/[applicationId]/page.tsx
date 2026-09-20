import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardListIcon, FilePenLineIcon } from "lucide-react";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { EnrollmentWizard } from "@features/enrollment-applications/components/EnrollmentWizard";
import {
  fetchEnrollmentApplicationById,
  fetchEnrollmentApplicationCourses,
  fetchEnrollmentApplicationShifts,
} from "@features/enrollment-applications/services/enrollment-application.service";
import { ENROLLMENT_APPLICATION_STATUS } from "@features/enrollment-applications/types/enrollment-application-status.types";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

interface MyEnrollmentApplicationDetailPageProps {
  params: Promise<{
    applicationId: string;
  }>;
  searchParams: Promise<{
    returnTo?: QueryParamValue;
  }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de inscripción");
}

export default async function MyEnrollmentApplicationDetailPage({
  params,
  searchParams,
}: MyEnrollmentApplicationDetailPageProps): Promise<React.ReactElement> {
  const [{ applicationId }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/my-enrollment-applications");
  const application = await fetchEnrollmentApplicationById(applicationId).catch(() => null);

  if (!application) {
    notFound();
  }

  const isEditable = application.status === ENROLLMENT_APPLICATION_STATUS.DRAFT;
  const detailLabel = isEditable ? "Continuar inscripción" : "Detalle de inscripción";
  const detailContext = [application.trainingPathName, application.academicYearName].filter(Boolean).join(" ");
  const breadcrumbLabel = detailContext ? `${detailLabel} · ${detailContext}` : detailLabel;
  const PageIcon = isEditable ? FilePenLineIcon : ClipboardListIcon;
  const [shifts, courses] = await Promise.all([
    isEditable ? fetchEnrollmentApplicationShifts(applicationId) : Promise.resolve([]),
    isEditable ? fetchEnrollmentApplicationCourses(applicationId) : Promise.resolve({ items: [], page: 0, size: 0, totalItems: 0, totalPages: 0 }),
  ]);

  return (
    <PlatformPageShell
      title={detailLabel}
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ [applicationId]: breadcrumbLabel }} />}
      actions={<PlatformPageIcon icon={PageIcon} />}
    >
      {!isEditable ? (
        <div className="flex items-center">
          <Button asChild variant="outline" size="lg">
            <Link href={destination}>Volver</Link>
          </Button>
        </div>
      ) : null}
      <EnrollmentWizard
        initialApplication={application}
        initialShifts={shifts}
        initialCourseOptions={courses.items}
        initialCourseOptionsPage={courses.page}
        initialCourseOptionsTotalPages={courses.totalPages}
        readOnly={!isEditable}
        returnTo={destination}
      />
    </PlatformPageShell>
  );
}
