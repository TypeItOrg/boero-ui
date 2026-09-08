import "server-only";

import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { fetchStudyPlans } from "@features/academic/services/academic.service";
import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentStart } from "@features/enrollment-applications/components/EnrollmentStart";
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

  // El aspirante elige plan de estudio y ciclo lectivo entre las opciones
  // realmente disponibles: sólo los ciclos con un período de inscripción
  // abierto admiten crear una solicitud (EnrollmentPeriodClosedException).
  let studyPlans: Awaited<ReturnType<typeof fetchStudyPlans>>["items"] = [];
  let openPeriods: Awaited<ReturnType<typeof listEnrollmentPeriods>>["items"] = [];

  try {
    const [plansResponse, openPeriodsResponse] = await Promise.all([
      fetchStudyPlans(AcademicScope.INSTITUTIONAL, person.institutionId, { size: 100 }),
      listEnrollmentPeriods(person.institutionId, { status: "OPEN", size: 100 }),
    ]);
    studyPlans = plansResponse.items;
    openPeriods = openPeriodsResponse.items;
  } catch {
    // Si ocurre algún fallo de permisos en la consulta, se mantiene sin opciones
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <EnrollmentStart studyPlans={studyPlans} periods={openPeriods} />
    </main>
  );
}
