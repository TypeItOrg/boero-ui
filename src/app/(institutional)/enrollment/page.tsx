import type { ReactElement } from "react";

import "server-only";

import type { Metadata } from "next";
import Link from "next/link";

import { AlertCircleIcon, ClipboardPlusIcon } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { parsePaginationQuery } from "@common/utils/pagination-query.util";

import { EnrollmentCatalogPagination } from "@features/enrollment-applications/components/enrollment-catalog-pagination";
import { EnrollmentStart } from "@features/enrollment-applications/components/EnrollmentStart";
import { fetchAvailableEnrollmentTrainingPaths } from "@features/enrollment-applications/services/enrollment-application.service";
import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { filterActiveGuardianDependents } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { getGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";
import { resolveGuardianWorkspaceDependent } from "@features/guardian-workspace/utils/resolve-guardian-workspace-dependent.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents, canStartEnrollmentApplication, isGuardian } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nueva inscripción");
}

export default async function EnrollmentPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }): Promise<ReactElement> {
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

  const dependents = canManageDependents(user) ? filterActiveGuardianDependents(await fetchGuardianDependents(person.institutionId)) : [];

  const guardianOnly = isGuardian(user);

  const workspaceId = guardianOnly ? await getGuardianWorkspaceId() : undefined;

  const selectedDependent = resolveGuardianWorkspaceDependent(dependents, workspaceId);

  if (guardianOnly && dependents.length === 0) {
    return (
      <PlatformPageShell title="Nueva inscripción" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}>
        <Alert>
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Todavía no tenés personas a cargo</AlertTitle>
          <AlertDescription>
            Como tutor, solo podés inscribir a personas a tu cargo. Agregalas en <Link href="/my-dependents">Mis personas a cargo</Link>.
          </AlertDescription>
        </Alert>
      </PlatformPageShell>
    );
  }

  if (guardianOnly && !selectedDependent) {
    return (
      <PlatformPageShell title="Nueva inscripción" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}>
        <Alert>
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Seleccioná una persona a cargo</AlertTitle>
          <AlertDescription>Elegí una persona a cargo desde el selector de cuenta para iniciar su inscripción.</AlertDescription>
        </Alert>
      </PlatformPageShell>
    );
  }

  const plansResponse = await fetchAvailableEnrollmentTrainingPaths(plansPage);

  const availableStudyPlans = plansResponse.items;

  return (
    <PlatformPageShell title="Nueva inscripción" breadcrumb={<InstitutionalBreadcrumb />} actions={<PlatformPageIcon icon={ClipboardPlusIcon} />}>
      {selectedDependent ? (
        <Alert>
          <AlertCircleIcon className="size-4" />
          <AlertTitle>
            Inscribiendo a: {selectedDependent.firstName} {selectedDependent.lastName}
          </AlertTitle>
        </Alert>
      ) : null}
      <EnrollmentStart
        applicantPersonId={selectedDependent?.dependentPersonId}
        studyPlans={availableStudyPlans.map((plan) => ({
          id: plan.id,
          name: plan.name,
          trainingPathName: plan.name,
        }))}
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
