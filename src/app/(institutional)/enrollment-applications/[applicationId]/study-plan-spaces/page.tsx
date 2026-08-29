import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookMarkedIcon, GraduationCapIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { fetchAcademicYear, fetchStudyPlan } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentStudyPlanSpacesForm } from "@features/enrollment/components/enrollment-study-plan-spaces-form";
import { fetchEnrollmentApplicationStudyPlanSpaces } from "@features/enrollment/services/fetch-enrollment-application-study-plan-spaces.service";
import { fetchEnrollmentApplication } from "@features/enrollment/services/fetch-enrollment-application.service";
import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Seleccionar espacios academicos");
}

export default async function EnrollmentApplicationStudyPlanSpacesPage({
  params,
  searchParams,
}: {
  params: Promise<{ applicationId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { applicationId } = await params;
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/");
  const user = await requireInstitutionalUser();

  if (!isApplicantInstitutionalUser(user)) {
    return <InstitutionalAccessDenied description="Esta pantalla esta disponible solo para postulantes con una solicitud en curso." />;
  }

  const application = await fetchEnrollmentApplication(applicationId);
  if (!application) notFound();

  const [studyPlanSpaces, studyPlan, academicYear] = await Promise.all([
    fetchEnrollmentApplicationStudyPlanSpaces(applicationId),
    fetchStudyPlan(AcademicScope.INSTITUTIONAL, user.institutionId, application.studyPlanId),
    fetchAcademicYear(AcademicScope.INSTITUTIONAL, user.institutionId, application.academicYearId),
  ]);

  return (
    <PlatformPageShell
      title="Seleccionar espacios academicos"
      minViewportHeight
      breadcrumb={
        <InstitutionalBreadcrumb
          hiddenSegments={[applicationId]}
          segmentLabels={{ "enrollment-applications": "Solicitudes", "study-plan-spaces": "Espacios academicos" }}
        />
      }
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div
          data-slot="platform-page-icon"
          className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex"
        >
          <GraduationCapIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <section className="space-y-5">
        <div className="bg-muted/30 grid gap-3 rounded-xl border p-4 md:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <BookMarkedIcon className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Plan de estudio</p>
              <p className="font-medium">{studyPlan?.name ?? application.studyPlanId}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary/10 text-primary rounded-xl p-2">
              <GraduationCapIcon className="size-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Solicitud</p>
              <p className="font-medium">#{application.applicationId.slice(0, 8)}</p>
            </div>
          </div>
        </div>

        <EnrollmentStudyPlanSpacesForm
          applicationId={application.applicationId}
          applicationEditable={application.isEditable}
          currentData={application.data}
          studyPlanSpaces={studyPlanSpaces}
          returnTo={destination}
          studyPlanName={studyPlan?.name ?? application.studyPlanId}
          academicYearLabel={academicYear ? String(academicYear.year) : application.academicYearId}
        />
      </section>
    </PlatformPageShell>
  );
}
