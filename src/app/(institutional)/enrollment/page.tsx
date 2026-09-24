import "server-only";

import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, ClipboardPlusIcon } from "lucide-react";

import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { fetchAcademicOffers } from "@features/academic-offers/services/academic-offer.service";
import { fetchAvailableEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { EnrollmentStart } from "@features/enrollment-applications/components/EnrollmentStart";
import { fetchActiveEnrollmentPaths } from "@features/enrollment-applications/services/fetch-active-enrollment-paths.service";
import { EnrollmentCatalogPagination } from "@features/enrollment-applications/components/enrollment-catalog-pagination";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canStartEnrollmentApplication } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nueva inscripción");
}

export default async function EnrollmentPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}): Promise<React.ReactElement> {
  const query = await searchParams;
  const plansPage = parsePaginationQuery({ page: query.plansPage }, { defaultSize: 20 });
  const periodsPage = parsePaginationQuery({ page: query.periodsPage }, { defaultSize: 20 });
  const [user, person] = await Promise.all([requireInstitutionalUser(), fetchInstitutionalPerson()]);

  if (!canStartEnrollmentApplication(user)) {
    return <InstitutionalAccessDenied description="No tenés permisos para iniciar una inscripción en esta institución." />;
  }

  if (!person || !person.institutionId) {
    return (
      <PlatformPageShell title="Nueva inscripción" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}>
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Sesión inválida</AlertTitle>
          <AlertDescription>No pudimos determinar tu institución asignada para realizar inscripciones.</AlertDescription>
        </Alert>
      </PlatformPageShell>
    );
  }

  const [plansResponse, periodsResponse, activePaths] = await Promise.all([
    fetchAcademicOffers(person.institutionId, plansPage),
    fetchAvailableEnrollmentPeriods(periodsPage),
    // Scoped to the caller: a guardian's list also holds their dependents' applications.
    fetchActiveEnrollmentPaths(person.institutionId, user.personId ?? undefined),
  ]);

  const availableStudyPlans = plansResponse.items.filter((plan) => !activePaths.trainingPathIds.has(plan.trainingPathId));
  const hasActiveApplication = activePaths.studyPlanIds.size > 0;
  const allExcludedByActiveApplication =
    hasActiveApplication && plansResponse.totalPages <= 1 && plansResponse.items.length > 0 && availableStudyPlans.length === 0;

  return (
    <PlatformPageShell title="Nueva inscripción" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}>
      {hasActiveApplication && !allExcludedByActiveApplication && (
        <Alert variant="success">
          <CheckCircle2Icon className="size-4" />
          <AlertTitle>¡Ya estás en carrera!</AlertTitle>
          <AlertDescription>
            Tenés una solicitud de inscripción en curso, así que esos trayectos no aparecen acá para que no la dupliques. Podés seguirla en{" "}
            <Link href="/my-enrollment-applications">Mis inscripciones</Link>.
          </AlertDescription>
        </Alert>
      )}
      <EnrollmentStart
        studyPlans={availableStudyPlans.map((plan) => ({
          id: plan.studyPlanId,
          name: plan.studyPlanName,
          trainingPathName: plan.trainingPathName,
        }))}
        periods={periodsResponse.items}
        studyPlanPagination={
          plansResponse.totalPages > 1 ? (
            <EnrollmentCatalogPagination
              page={plansResponse.page}
              totalPages={plansResponse.totalPages}
              parameter="plansPage"
              query={query}
              label="Páginas de planes de estudio"
            />
          ) : undefined
        }
        periodPagination={
          periodsResponse.totalPages > 1 ? (
            <EnrollmentCatalogPagination
              page={periodsResponse.page}
              totalPages={periodsResponse.totalPages}
              parameter="periodsPage"
              query={query}
              label="Páginas de ciclos con inscripción abierta"
            />
          ) : undefined
        }
        allExcludedByActiveApplication={allExcludedByActiveApplication}
      />
    </PlatformPageShell>
  );
}
