import "server-only";

import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { fetchStudyPlans, fetchAcademicYears } from "@features/academic/services/academic.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentWizard } from "@features/enrollment-applications/components/EnrollmentWizard";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";
import { AlertCircleIcon } from "lucide-react";

export default async function EnrollmentPage(): Promise<React.ReactElement> {
  const person = await fetchInstitutionalPerson();

  if (!person || !person.institutionId) {
    return (
      <main className="flex-1 p-6">
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Sesión inválida</AlertTitle>
          <AlertDescription>No pudimos determinar tu institución asignada para realizar inscripciones.</AlertDescription>
        </Alert>
      </main>
    );
  }

  // 1. Obtener un Plan de Estudio activo y el Ciclo Lectivo activo para presentar en el flujo
  const [plansResponse, yearsResponse] = await Promise.all([
    fetchStudyPlans(AcademicScope.INSTITUTIONAL, person.institutionId, { size: 1, status: "ACTIVE" }),
    fetchAcademicYears(AcademicScope.INSTITUTIONAL, person.institutionId, { size: 1, status: "ACTIVE" }),
  ]);

  const activePlan = plansResponse.items[0];
  const activeYear = yearsResponse.items[0];

  if (!activePlan || !activeYear) {
    return (
      <main className="flex-1 p-6">
        <Alert variant="destructive">
          <AlertCircleIcon className="size-4" />
          <AlertTitle>Inscripción no disponible</AlertTitle>
          <AlertDescription>No hay planes de estudio o ciclos lectivos activos en este momento para la institución.</AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <EnrollmentWizard studyPlanId={activePlan.id} academicYearId={activeYear.id} />
    </main>
  );
}
