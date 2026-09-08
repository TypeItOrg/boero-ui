import type { Metadata } from "next";
import { Suspense } from "react";
import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { fetchAcademicYears } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodsTable } from "@features/enrollment-periods/components/EnrollmentPeriodsTable";
import { Alert, AlertDescription, AlertTitle } from "@common/components/ui/alert";
import { ShieldAlertIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "Períodos de Inscripción",
  description: "Gestión de períodos de inscripción anuales de la institución",
};

interface Props {
  searchParams: Promise<{
    academicYearId?: string;
    status?: string;
    search?: string;
    page?: string;
  }>;
}

export default async function EnrollmentPeriodsPage({ searchParams }: Props) {
  const user = await getInstitutionalUser();

  if (!user || !hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_READ)) {
    return (
      <main className="flex-1 p-6">
        <Alert variant="destructive">
          <ShieldAlertIcon className="size-4" />
          <AlertTitle>Acceso denegado</AlertTitle>
          <AlertDescription>No tenés permisos para administrar los períodos de inscripción.</AlertDescription>
        </Alert>
      </main>
    );
  }

  const { academicYearId, status, search, page } = await searchParams;
  const currentPage = page ? parseInt(page, 10) : 0;

  const [periodsData, academicYearsData] = await Promise.all([
    listEnrollmentPeriods(user.institutionId, {
      academicYearId: academicYearId !== "all" ? academicYearId : undefined,
      status: status !== "all" ? status : undefined,
      search,
      page: currentPage,
      size: 10,
    }),
    fetchAcademicYears(AcademicScope.INSTITUTIONAL, user.institutionId, { size: 100 }).catch(() => ({ items: [] })),
  ]);

  const canCreate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_CREATE);
  const canUpdate = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_UPDATE);
  const canChangeStatus = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_STATUS_UPDATE);
  const canDelete = hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_DELETE);

  return (
    <main className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Períodos de Inscripción</h1>
          <p className="text-muted-foreground text-sm">Configuración y apertura de períodos para habilitar la pre-inscripción de estudiantes.</p>
        </div>
      </div>

      <Suspense fallback={<div className="text-muted-foreground p-4 text-center text-sm">Cargando...</div>}>
        <EnrollmentPeriodsTable
          institutionId={user.institutionId}
          data={periodsData}
          academicYears={academicYearsData.items}
          canCreate={canCreate}
          canUpdate={canUpdate}
          canChangeStatus={canChangeStatus}
          canDelete={canDelete}
        />
      </Suspense>
    </main>
  );
}
