import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardListIcon } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentApplicationResolvePanel } from "@features/enrollment-applications/components/enrollment-application-resolve-panel";
import { EnrollmentStatusCard } from "@features/enrollment-applications/components/EnrollmentStatusCard";
import { fetchInstitutionalEnrollmentApplicationById } from "@features/enrollment-applications/services/enrollment-application.service";
import { formatEnrollmentApplicationBreadcrumbLabel } from "@features/enrollment-applications/utils/enrollment-application-breadcrumb.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission, hasTrainingPathPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EnrollmentApplicationDetailPageProps = {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de solicitud de inscripción");
}

export default async function EnrollmentApplicationDetailPage({
  params,
  searchParams,
}: EnrollmentApplicationDetailPageProps): Promise<React.ReactElement> {
  const [{ applicationId }, { returnTo }, user] = await Promise.all([params, searchParams, requireInstitutionalUser()]);

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar solicitudes de inscripción." />;
  }

  const destination = getSafeReturnTo(returnTo, "/enrollment-applications");
  const application = await fetchInstitutionalEnrollmentApplicationById(user.institutionId, applicationId);

  if (!application) {
    notFound();
  }

  const personalData = application.data?.personalData;
  const personalDataName = `${personalData?.firstName || ""} ${personalData?.lastName || ""}`.trim();
  const applicantName = application.applicantName || personalDataName || "Solicitante";
  const reviewSummary = {
    institutionId: user.institutionId,
    applicationId,
    applicantName,
    studyPlanName: application.studyPlanName || "—",
  };

  return (
    <PlatformPageShell
      title={applicantName}
      breadcrumb={
        <InstitutionalBreadcrumb segmentLabels={{ [applicationId]: formatEnrollmentApplicationBreadcrumbLabel(application, applicantName) }} />
      }
      actions={<PlatformPageIcon icon={ClipboardListIcon} />}
    >
      <div className="flex flex-col gap-3 @2xl/page-shell:flex-row @2xl/page-shell:items-center @2xl/page-shell:justify-between">
        <Button asChild variant="outline" size="lg" className="w-full @2xl/page-shell:w-auto">
          <Link href={destination}>Volver</Link>
        </Button>

        <EnrollmentApplicationResolvePanel
          application={reviewSummary}
          status={application.status}
          canApprove={hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_APPROVE, application.trainingPathId ?? "")}
          canReject={hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_REJECT, application.trainingPathId ?? "")}
        />
      </div>

      <EnrollmentStatusCard
        application={application}
        showApplicantAlert={false}
        scope={AcademicScope.INSTITUTIONAL}
        canManageCourses={
          hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_COURSE_READ, application.trainingPathId ?? "") ||
          hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_COURSE_ENROLL, application.trainingPathId ?? "") ||
          hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_COURSE_REJECT, application.trainingPathId ?? "")
        }
        canEnrollCourses={hasTrainingPathPermission(
          user,
          INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_COURSE_ENROLL,
          application.trainingPathId ?? "",
        )}
        canRejectCourses={hasTrainingPathPermission(
          user,
          INSTITUTIONAL_PERMISSION.ENROLLMENT_APPLICATION_COURSE_REJECT,
          application.trainingPathId ?? "",
        )}
        canReadCourseWaitlist={hasTrainingPathPermission(user, INSTITUTIONAL_PERMISSION.COURSE_WAITLIST_READ, application.trainingPathId ?? "")}
      />
    </PlatformPageShell>
  );
}
