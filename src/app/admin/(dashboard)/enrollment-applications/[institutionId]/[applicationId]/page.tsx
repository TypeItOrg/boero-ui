import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardListIcon } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@common/components/ui/button";
import { getPlatformEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import { EnrollmentStatusCard } from "@features/enrollment-applications/components/EnrollmentStatusCard";
import { PlatformEnrollmentApplicationResolvePanel } from "@features/enrollment-applications/components/platform-enrollment-application-resolve-panel";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";

export const metadata: Metadata = { title: "Detalle de solicitud de inscripción" };

type PlatformEnrollmentApplicationDetailPageProps = {
  params: Promise<{ institutionId: string; applicationId: string }>;
};

export default async function PlatformEnrollmentApplicationDetailPage({
  params,
}: PlatformEnrollmentApplicationDetailPageProps): Promise<React.ReactElement> {
  const { institutionId, applicationId } = await params;
  const application = await getPlatformEnrollmentApplicationAction(institutionId, applicationId);
  if (!application) notFound();

  const applicantName = application.applicantName || "Solicitante";

  return (
    <section className="flex max-w-full min-w-0 flex-1 flex-col gap-4 p-3 md:p-4">
      <header className="bg-background flex min-w-0 flex-row items-center justify-between gap-4 rounded-xl p-4 shadow-xs sm:p-6">
        <div className="min-w-0">
          <PlatformBreadcrumb hiddenSegments={[institutionId]} segmentLabels={{ [applicationId]: applicantName }} />
          <h1 className="text-foreground max-w-4xl text-3xl font-bold tracking-tight sm:text-4xl">{applicantName}</h1>
        </div>
        <div className="from-primary to-primary/80 text-primary-foreground hidden h-full min-h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br shadow-xs sm:flex">
          <ClipboardListIcon className="size-6 sm:size-7" aria-hidden="true" />
        </div>
      </header>

      <div className="bg-background flex min-w-0 flex-1 flex-col gap-4 rounded-xl p-4 shadow-xs sm:p-6">
        <Button asChild variant="outline" size="lg" className="self-start">
          <Link href="/admin/enrollment-applications">Volver</Link>
        </Button>

        <div className="grid flex-1 gap-4 xl:max-h-[calc(100dvh-11rem)] xl:grid-cols-[minmax(0,1fr)_minmax(18rem,20rem)] xl:overflow-y-auto">
          <EnrollmentStatusCard application={application} showApplicantAlert={false} />

          <div>
            <div className="xl:sticky xl:top-4">
              <PlatformEnrollmentApplicationResolvePanel
                application={{
                  institutionId,
                  applicationId,
                  applicantName,
                  studyPlanName: application.studyPlanName || "",
                }}
                status={application.status}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
