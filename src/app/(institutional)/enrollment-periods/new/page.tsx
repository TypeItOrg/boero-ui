import type { Metadata } from "next";
import { CalendarRangeIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodForm } from "@features/enrollment-periods/components/enrollment-period-form";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Nuevo período de inscripción");
}

export default async function NewEnrollmentPeriodPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const { returnTo } = await searchParams;
  const destination = getSafeReturnTo(returnTo, "/enrollment-periods");
  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_CREATE)) {
    return <InstitutionalAccessDenied description="No tenés permisos para crear períodos de inscripción." />;
  }

  return (
    <PlatformPageShell
      title="Nuevo período de inscripción"
      breadcrumb={<InstitutionalBreadcrumb segmentLabels={{ new: "Nuevo" }} />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <EnrollmentPeriodForm initialInstitution={{ id: user.institutionId, name: "" }} returnTo={destination} scope={AcademicScope.INSTITUTIONAL} />
    </PlatformPageShell>
  );
}
