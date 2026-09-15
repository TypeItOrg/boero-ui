import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { fetchInstitutions } from "@features/institutions/services/fetch-institutions.service";
import { parseInstitutionPaginationParams } from "@features/institutions/utils/institution-pagination.util";
import { isValidUuid } from "@common/utils/action-argument.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { parseEnrollmentPeriodPaginationParams } from "@features/enrollment-periods/utils/enrollment-period-pagination.util";
import { fetchAcademicYear } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodsTable } from "@features/enrollment-periods/components/EnrollmentPeriodsTable";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { CalendarRangeIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Períodos de Inscripción - Admin",
  description: "Gestión global de períodos de inscripción por institución",
};

interface Props {
  searchParams: Promise<{
    institutionId?: string;
    academicYearId?: string;
    status?: string;
    search?: string;
    page?: string;
    size?: string;
  }>;
}

export default async function AdminEnrollmentPeriodsPage({ searchParams }: Props) {
  await requirePlatformAccount();
  const query = await searchParams;
  const params = parseEnrollmentPeriodPaginationParams(query);
  const selectedInstitution = isValidUuid(query.institutionId)
    ? await fetchInstitution(query.institutionId!)
    : (await fetchInstitutions(parseInstitutionPaginationParams({}))).items[0];
  const targetInstitutionId = selectedInstitution?.id;

  const [periodsData, selectedAcademicYear] = targetInstitutionId
    ? await Promise.all([
        listEnrollmentPeriods(targetInstitutionId, params, AcademicScope.ADMIN),
        params.academicYearId ? fetchAcademicYear(AcademicScope.ADMIN, targetInstitutionId, params.academicYearId) : null,
      ])
    : [{ items: [], totalPages: 0, totalItems: 0, page: params.page, size: params.size }, null];

  return (
    <PlatformPageShell title="Períodos de Inscripción" breadcrumb={<PlatformBreadcrumb />} actions={<PlatformPageIcon icon={CalendarRangeIcon} />}>
      <main className="flex-1 space-y-6">
        <Suspense fallback={<div className="text-muted-foreground p-4 text-center text-sm">Cargando...</div>}>
          {targetInstitutionId ? (
            <EnrollmentPeriodsTable
              institutionId={targetInstitutionId}
              data={periodsData}
              selectedAcademicYear={selectedAcademicYear}
              institutionName={selectedInstitution?.name}
              search={params.search}
              status={params.status}
              canCreate={true}
              canUpdate={true}
              canChangeStatus={true}
              canDelete={true}
              scope={AcademicScope.ADMIN}
            />
          ) : (
            <div className="text-muted-foreground p-6 text-center">No hay instituciones registradas en la plataforma para gestionar períodos.</div>
          )}
        </Suspense>
      </main>
    </PlatformPageShell>
  );
}
