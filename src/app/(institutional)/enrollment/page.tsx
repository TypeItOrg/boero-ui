import "server-only";

import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircleIcon, CheckCircle2Icon, ClipboardPlusIcon } from "lucide-react";

import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { fetchStudyPlans } from "@features/academic/services/academic.service";
import { listEnrollmentPeriods } from "@features/enrollment-periods/services/enrollment-period.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentStart } from "@features/enrollment-applications/components/EnrollmentStart";
import { fetchMyEnrollmentApplications } from "@features/enrollment-applications/services/enrollment-application.service";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";
import { Alert, AlertTitle, AlertDescription } from "@common/components/ui/alert";

const INACTIVE_STATUSES = new Set(["CANCELLED", "REJECTED"]);

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nueva inscripción");
}

export default async function EnrollmentPage(): Promise<React.ReactElement> {
  const person = await fetchInstitutionalPerson();

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

  // El aspirante elige plan de estudio y ciclo lectivo entre las opciones
  // realmente disponibles: sólo los ciclos con un período de inscripción
  // abierto admiten crear una solicitud (EnrollmentPeriodClosedException).
  let studyPlans: Awaited<ReturnType<typeof fetchStudyPlans>>["items"] = [];
  let openPeriods: Awaited<ReturnType<typeof listEnrollmentPeriods>>["items"] = [];
  let myApplications: Awaited<ReturnType<typeof fetchMyEnrollmentApplications>>["items"] = [];

  try {
    const [plansResponse, openPeriodsResponse, myApplicationsResponse] = await Promise.all([
      fetchStudyPlans(AcademicScope.INSTITUTIONAL, person.institutionId, { size: 100 }),
      listEnrollmentPeriods(person.institutionId, { status: "OPEN", size: 100 }),
      fetchMyEnrollmentApplications(person.institutionId, { page: 0, size: 100 }),
    ]);
    studyPlans = plansResponse.items;
    openPeriods = openPeriodsResponse.items;
    myApplications = myApplicationsResponse.items;
  } catch {
    // Si ocurre algún fallo de permisos en la consulta, se mantiene sin opciones
  }

  // Una única inscripción viva por trayecto: se excluyen los planes de los
  // trayectos donde ya existe una solicitud no cancelada/rechazada.
  const trainingPathIdByStudyPlanId = new Map(studyPlans.map((plan) => [plan.id, plan.trainingPathId]));
  const activeTrainingPathIds = new Set(
    myApplications
      .filter((application) => !INACTIVE_STATUSES.has(application.status))
      .map((application) => trainingPathIdByStudyPlanId.get(application.studyPlanId))
      .filter((trainingPathId): trainingPathId is string => Boolean(trainingPathId)),
  );
  const availableStudyPlans = studyPlans.filter((plan) => !activeTrainingPathIds.has(plan.trainingPathId));
  const hasActiveApplication = activeTrainingPathIds.size > 0;
  const allExcludedByActiveApplication = hasActiveApplication && availableStudyPlans.length === 0;

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
      <EnrollmentStart studyPlans={availableStudyPlans} periods={openPeriods} allExcludedByActiveApplication={allExcludedByActiveApplication} />
    </PlatformPageShell>
  );
}
