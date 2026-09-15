import { redirect } from "next/navigation";

interface EnrollmentDetailPageProps {
  params: Promise<{
    applicationId: string;
  }>;
}

export default async function EnrollmentDetailPage({ params }: EnrollmentDetailPageProps) {
  const { applicationId } = await params;

  redirect(`/my-enrollment-applications/${applicationId}`);
}
