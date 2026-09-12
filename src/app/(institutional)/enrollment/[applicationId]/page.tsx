import { notFound, redirect } from "next/navigation";
import { getEnrollmentApplicationAction } from "@features/enrollment-applications/actions/enrollment-application.actions";
import { EnrollmentWizard } from "@features/enrollment-applications/components/EnrollmentWizard";

interface EnrollmentDetailPageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default async function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const { applicationId } = await params;
  const application = await getEnrollmentApplicationAction(applicationId).catch(() => null);

  if (!application) {
    notFound();
  }

  // If application exists, it has studyPlanId and academicYearId in its data
  const studyPlanId = application.studyPlanId;
  const academicYearId = application.academicYearId;
  const isEditable = application.status === "DRAFT";

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 p-6">
      <EnrollmentWizard studyPlanId={studyPlanId} academicYearId={academicYearId} applicationId={applicationId} readOnly={!isEditable} />
    </main>
  );
}
