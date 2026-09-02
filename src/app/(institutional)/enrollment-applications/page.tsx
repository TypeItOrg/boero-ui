import type { Metadata } from "next";
import Link from "next/link";
import { BookMarkedIcon, ChevronRightIcon, FileTextIcon, RouteIcon } from "lucide-react";

import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { fetchEnrollmentApplications } from "@features/enrollment/services/fetch-enrollment-applications.service";
import type { EnrollmentApplication } from "@features/enrollment/types/enrollment-application.types";
import { isApplicantInstitutionalUser } from "@features/enrollment/utils/is-applicant-institutional-user.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Mis solicitudes");
}

export default async function EnrollmentApplicationsPage(): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();

  if (!isApplicantInstitutionalUser(user)) {
    return <InstitutionalAccessDenied description="Esta sección está disponible solo para postulantes." />;
  }

  const applications = await fetchEnrollmentApplications();

  return (
    <PlatformPageShell
      title="Mis solicitudes"
      minViewportHeight
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ "enrollment-applications": "Solicitudes" }} />}
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={
        <div data-slot="platform-page-icon" className="from-primary to-primary/80 text-primary-foreground hidden h-full items-center justify-center rounded-2xl bg-linear-to-br px-4 shadow-xs sm:flex">
          <FileTextIcon className="size-6 sm:size-7" />
        </div>
      }
    >
      <section className="space-y-4">
        {applications.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle>No hay solicitudes disponibles</CardTitle>
              <CardDescription>Todavía no tenés solicitudes de inscripción para continuar desde este portal.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {applications.map((application) => (
              <ApplicationCard key={application.applicationId} application={application} />
            ))}
          </div>
        )}
      </section>
    </PlatformPageShell>
  );
}

function ApplicationCard({ application }: { application: EnrollmentApplication }): React.ReactElement {
  const trainingPathSelected = Boolean(application.data.careerSelection?.trainingPathId);
  const selectedSpaceCount = application.data.academicSpaceSelection?.studyPlanSpaceIds?.length ?? 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Solicitud #{application.applicationId.slice(0, 8)}</CardTitle>
            <CardDescription>Plan {application.studyPlanId.slice(0, 8)} · Año {application.academicYearId.slice(0, 8)}</CardDescription>
          </div>
          <Badge variant={application.isEditable ? "default" : "secondary"}>{application.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
        <InfoRow label="Trayecto" value={trainingPathSelected ? "Seleccionado" : "Pendiente"} icon={RouteIcon} />
        <InfoRow label="Espacios" value={selectedSpaceCount > 0 ? `${selectedSpaceCount} seleccionados` : "Pendiente"} icon={BookMarkedIcon} />
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={`/enrollment-applications/${application.applicationId}/training-path`}>
            Trayecto formativo
            <ChevronRightIcon />
          </Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href={`/enrollment-applications/${application.applicationId}/study-plan-spaces?returnTo=${encodeURIComponent(`/enrollment-applications/${application.applicationId}/training-path`)}`}>
            Espacios académicos
            <ChevronRightIcon />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

function InfoRow({ label, value, icon: Icon }: { label: string; value: string; icon: typeof RouteIcon }): React.ReactElement {
  return (
    <div className="bg-muted/40 rounded-lg border px-3 py-2">
      <div className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wide uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
