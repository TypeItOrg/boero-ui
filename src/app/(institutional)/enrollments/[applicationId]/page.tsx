import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon, FileTextIcon } from "lucide-react";
import { Button } from "@common/components/ui/button";
import { getSafeReturnTo, appendReturnTo } from "@common/utils/return-to.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { fetchEnrollmentApplicationById } from "@features/enrollment-applications/services/enrollment-application.service";
import { fetchStudyPlans, fetchAcademicYears } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentDetailView } from "@features/enrollment-applications/components/EnrollmentDetailView";
import { getApplicantFullName } from "@features/enrollment-applications/utils/enrollment-application.util";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de Inscripción");
}

interface Props {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function EnrollmentDetailPage({ params, searchParams }: Props): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para consultar esta solicitud de inscripción." />;
  }

  const [{ applicationId }, { returnTo }] = await Promise.all([params, searchParams]);
  const destination = getSafeReturnTo(returnTo, "/enrollments");

  let application;
  try {
    application = await fetchEnrollmentApplicationById(applicationId);
  } catch {
    notFound();
  }

  if (!application) {
    notFound();
  }

  const [studyPlansData, academicYearsData] = await Promise.all([
    fetchStudyPlans(AcademicScope.INSTITUTIONAL, user.institutionId, { size: 100 }).catch(() => ({ items: [] })),
    fetchAcademicYears(AcademicScope.INSTITUTIONAL, user.institutionId, { size: 100 }).catch(() => ({ items: [] })),
  ]);

  const studyPlan = studyPlansData.items.find((p) => p.id === application.studyPlanId);
  const academicYear = academicYearsData.items.find((y) => y.id === application.academicYearId);
  const applicantName = getApplicantFullName(application);

  return (
    <PlatformPageShell
      title="Detalle de Inscripción"
      breadcrumb={
        <InstitutionalBreadcrumb
          segmentHrefs={{
            [applicationId]: appendReturnTo(`/enrollments/${applicationId}`, destination),
          }}
          segmentLabels={{
            enrollments: "Inscripciones",
            [applicationId]: applicantName,
          }}
        />
      }
      actions={<PlatformPageIcon icon={FileTextIcon} />}
    >
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" size="lg">
          <Link href={destination}>
            <ArrowLeftIcon data-icon="inline-start" className="size-4" />
            Volver al listado
          </Link>
        </Button>
      </div>

      <EnrollmentDetailView
        application={application}
        studyPlanName={application.studyPlanName || studyPlan?.name}
        academicYearName={application.academicYearName || (academicYear ? String(academicYear.year) : undefined)}
      />
    </PlatformPageShell>
  );
}
