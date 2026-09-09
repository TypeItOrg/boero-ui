import type { Metadata } from "next";
import { FilePlus2Icon } from "lucide-react";

import { fetchAcademicYears, fetchStudyPlans } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { CreateEnrollmentApplicationForm } from "@features/enrollment/components/create-enrollment-application-form";
import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nueva solicitud");
}

export default async function NewEnrollmentApplicationPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!isApplicantInstitutionalUser(user)) {
    return <InstitutionalAccessDenied description="Esta sección está disponible solo para postulantes." />;
  }

  const validOn = new Date().toISOString().slice(0, 10);
  const [studyPlansPage, academicYearsPage] = await Promise.all([
    fetchStudyPlans(AcademicScope.INSTITUTIONAL, user.institutionId, {
      size: 100,
      status: "ACTIVE",
      validOn,
    }),
    fetchAcademicYears(AcademicScope.INSTITUTIONAL, user.institutionId, {
      size: 100,
      status: "ACTIVE",
      validOn,
    }),
  ]);

  return (
    <PlatformPageShell
      title="Nueva solicitud"
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ "enrollment-applications": "Solicitudes", new: "Nueva solicitud" }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div data-slot="platform-page-icon" className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <FilePlus2Icon className="size-6 sm:size-7" />
        </div>
      }
    >
      <CreateEnrollmentApplicationForm
        academicYears={academicYearsPage.items}
        returnTo="/enrollment-applications"
        studyPlans={studyPlansPage.items}
      />
    </PlatformPageShell>
  );
}
