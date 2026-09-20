import "server-only";

import type { Metadata } from "next";
import { AlertCircleIcon, ClipboardPlusIcon } from "lucide-react";

import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { fetchAvailableEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { EnrollmentStart } from "@features/enrollment-applications/components/EnrollmentStart";
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
import { fetchAvailableEnrollmentTrainingPaths } from "@features/enrollment-applications/services/enrollment-application.service";

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

  const [plansResponse, periodsResponse] = await Promise.all([
    fetchAvailableEnrollmentTrainingPaths(plansPage),
    fetchAvailableEnrollmentPeriods({ page: 0, size: 20 }),
  ]);

  return (
    <PlatformPageShell title="Nueva inscripción" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}>
      <EnrollmentStart
        studyPlans={plansResponse.items.map((plan) => ({
          id: plan.id,
          name: plan.name,
          trainingPathName: plan.name,
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
      />
    </PlatformPageShell>
  );
}
