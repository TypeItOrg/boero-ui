import type { Metadata } from "next";
import { Suspense } from "react";
import { FilePenLineIcon } from "lucide-react";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { DataTableNavigationProvider } from "@common/components/ui/data-table-navigation";
import { fetchEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { fetchStudyPlans, fetchAcademicYears } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentsTableFilters } from "@features/enrollment-applications/components/EnrollmentsTableFilters";
import { EnrollmentsTable } from "@features/enrollment-applications/components/EnrollmentsTable";

export const metadata: Metadata = {
  title: "Inscripciones",
  description: "Gestión administrativa de solicitudes de inscripción",
};

interface Props {
  searchParams: Promise<{
    status?: string;
    periodId?: string;
    search?: string;
    page?: string;
    size?: string;
  }>;
}

export default async function EnrollmentsPage({ searchParams }: Props): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_READ)) {
    return <InstitutionalAccessDenied description="No tenés permisos para gestionar las solicitudes de inscripción de esta institución." />;
  }

  const { status, periodId, search, page, size } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 0;
  const currentSize = size ? parseInt(size, 10) : 10;

  const [applicationsData, enrollmentPeriodsData, studyPlansData, academicYearsData] = await Promise.all([
    fetchEnrollmentApplications({
      status: status !== "all" ? status : undefined,
      periodId: periodId !== "all" ? periodId : undefined,
      search,
      page: currentPage,
      size: currentSize,
    }),
    listEnrollmentPeriods(user.institutionId, { size: 100 }).catch(() => ({ items: [] })),
    fetchStudyPlans(AcademicScope.INSTITUTIONAL, user.institutionId, { size: 100 }).catch(() => ({ items: [] })),
    fetchAcademicYears(AcademicScope.INSTITUTIONAL, user.institutionId, { size: 100 }).catch(() => ({ items: [] })),
  ]);

  const studyPlansMap: Record<string, string> = {};
  for (const plan of studyPlansData.items) {
    studyPlansMap[plan.id] = plan.name;
  }

  const academicYearsMap: Record<string, string> = {};
  for (const year of academicYearsData.items) {
    academicYearsMap[year.id] = String(year.year);
  }

  return (
    <PlatformPageShell
      title="Inscripciones"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ enrollments: "Inscripciones" }} />}
      actions={<PlatformPageIcon icon={FilePenLineIcon} />}
    >
      <DataTableNavigationProvider>
        <EnrollmentsTableFilters
          search={search}
          size={currentSize}
          status={status}
          periodId={periodId}
          enrollmentPeriods={enrollmentPeriodsData.items.map((p) => ({ id: p.id, name: p.name }))}
        />
        <Suspense fallback={<div className="text-muted-foreground p-8 text-center text-sm">Cargando inscripciones...</div>}>
          <EnrollmentsTable
            data={applicationsData}
            page={currentPage}
            size={currentSize}
            studyPlansMap={studyPlansMap}
            academicYearsMap={academicYearsMap}
          />
        </Suspense>
      </DataTableNavigationProvider>
    </PlatformPageShell>
  );
}
