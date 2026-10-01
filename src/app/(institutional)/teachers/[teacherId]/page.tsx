import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@common/components/ui/button";
import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { TeacherDetailView } from "@features/people/components/teacher-detail-view";
import { fetchInstitutionTeacherDetail } from "@features/people/services/fetch-institution-teacher-detail.service";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Detalle de docente");
}

export default async function TeacherDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ teacherId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { teacherId } = await params;
  const { returnTo } = await searchParams;
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.PERSON_READ_ANY)) return <InstitutionalAccessDenied />;
  const teacher = await fetchInstitutionTeacherDetail(user.institutionId, teacherId);
  if (!teacher) notFound();
  const destination = getSafeReturnTo(returnTo, "/teachers");
  return (
    <PlatformPageShell title={`${teacher.person.firstName} ${teacher.person.lastName}`} breadcrumb={<InstitutionalBreadcrumb />}>
      <Button asChild variant="outline">
        <Link href={destination}>Volver a docentes</Link>
      </Button>
      <TeacherDetailView data={teacher} />
    </PlatformPageShell>
  );
}
