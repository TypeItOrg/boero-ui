import { formatStudyPlanLabel } from "@features/academic/utils/study-plan-label.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardListIcon } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { fetchPlatformEnrollmentApplicationById } from "@features/enrollment-applications/services/enrollment-application.service";
import { formatEnrollmentApplicationBreadcrumbLabel } from "@features/enrollment-applications/utils/enrollment-application-breadcrumb.util";
import { EnrollmentStatusCard } from "@features/enrollment-applications/components/EnrollmentStatusCard";
import { PlatformEnrollmentApplicationResolvePanel } from "@features/enrollment-applications/components/platform-enrollment-application-resolve-panel";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata: Metadata = { title: "Detalle de solicitud de inscripción" };

type PlatformEnrollmentApplicationDetailPageProps = {
  params: Promise<{ institutionId: string; applicationId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export default async function PlatformEnrollmentApplicationDetailPage({
  params,
  searchParams,
}: PlatformEnrollmentApplicationDetailPageProps): Promise<React.ReactElement> {
  const [{ institutionId, applicationId }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/admin/enrollment-applications");
  const application = await fetchPlatformEnrollmentApplicationById(institutionId, applicationId);

  if (!application) {
    notFound();
  }

  const personalData = application.data?.personalData;
  const personalDataName = `${personalData?.firstName || ""} ${personalData?.lastName || ""}`.trim();
  const applicantName = application.applicantName || personalDataName || "Solicitante";

  return (
    <PlatformPageShell
      title={applicantName}
      breadcrumb={
        <PlatformBreadcrumb
          hiddenSegments={[institutionId]}
          segmentLabels={{ [applicationId]: formatEnrollmentApplicationBreadcrumbLabel(application, applicantName) }}
        />
      }
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      <div className="flex flex-col gap-3 @2xl/page-shell:flex-row @2xl/page-shell:items-center @2xl/page-shell:justify-between">
        <Button asChild variant="outline" size="lg" className="w-full @2xl/page-shell:w-auto">
          <Link href={destination}>Volver</Link>
        </Button>

        <PlatformEnrollmentApplicationResolvePanel
          application={{
            institutionId,
            applicationId,
            applicantName,
            studyPlanName: application.studyPlanName ? formatStudyPlanLabel(application) : "",
          }}
          status={application.status}
        />
      </div>

      <EnrollmentStatusCard
        application={application}
        showApplicantAlert={false}
        scope={AcademicScope.ADMIN}
        institutionId={institutionId}
        canManageCourses
        canEnrollCourses
        canRejectCourses
        canReadCourseWaitlist
      />
    </PlatformPageShell>
  );
}
