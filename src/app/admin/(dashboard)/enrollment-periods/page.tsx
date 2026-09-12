import type { Metadata } from "next";
import { Suspense } from "react";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { fetchInstitutions } from "@features/institutions/services/fetch-institutions.service";
import { parseInstitutionPaginationParams } from "@features/institutions/utils/institution-pagination.util";
import { fetchAcademicYears } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodsTable } from "@features/enrollment-periods/components/EnrollmentPeriodsTable";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

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
  }>;
}

export default async function AdminEnrollmentPeriodsPage({ searchParams }: Props) {
  await requirePlatformAccount();
  const { institutionId, academicYearId, status, search, page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 0;

  // Obtener la primera institución activa si no se especificó una
  let targetInstitutionId = institutionId;
  const parsedParams = parseInstitutionPaginationParams({ size: "100" });
  const institutionsData = await fetchInstitutions(parsedParams).catch(() => ({ items: [] }));

  if (!targetInstitutionId && institutionsData.items.length > 0) {
    targetInstitutionId = institutionsData.items[0].id;
  }

  const [periodsData, academicYearsData] = targetInstitutionId
    ? await Promise.all([
        listEnrollmentPeriods(
          targetInstitutionId,
          {
            academicYearId: academicYearId !== "all" ? academicYearId : undefined,
            status: status !== "all" ? status : undefined,
            search,
            page: currentPage,
            size: 10,
          },
          AcademicScope.ADMIN,
        ).catch(() => ({ items: [], totalPages: 0, totalItems: 0, page: 0, size: 10 })),
        fetchAcademicYears(AcademicScope.ADMIN, targetInstitutionId, { size: 100 }).catch(() => ({ items: [] })),
      ])
    : [{ items: [], totalPages: 0, totalItems: 0, page: 0, size: 10 }, { items: [] }];

  return (
    <PlatformPageShell title="Períodos de Inscripción" breadcrumb={<PlatformBreadcrumb />}>
      <main className="flex-1 space-y-6">
        <Suspense fallback={<div className="text-muted-foreground p-4 text-center text-sm">Cargando...</div>}>
          {targetInstitutionId ? (
            <EnrollmentPeriodsTable
              institutionId={targetInstitutionId}
              data={periodsData}
              academicYears={academicYearsData.items}
              canCreate={true}
              canUpdate={true}
              canChangeStatus={true}
              canDelete={true}
              scope="admin"
            />
          ) : (
            <div className="text-muted-foreground p-6 text-center">No hay instituciones registradas en la plataforma para gestionar períodos.</div>
          )}
        </Suspense>
      </main>
    </PlatformPageShell>
  );
}
