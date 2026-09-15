import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CalendarRangeIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { parseUuidQueryParam } from "@common/utils/query-param.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodForm } from "@features/enrollment-periods/components/enrollment-period-form";
import { fetchEnrollmentPeriod } from "@features/enrollment-periods/services/enrollment-period.service";
import { InstitutionalAccessDenied } from "@features/institutional-auth/components/institutional-access-denied";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditEnrollmentPeriodPageProps = {
  params: Promise<{ periodId: string }>;
  searchParams: Promise<{ returnTo?: QueryParamValue }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getInstitutionalMetadata("Editar período de inscripción");
}

export default async function EditEnrollmentPeriodPage({ params, searchParams }: EditEnrollmentPeriodPageProps): Promise<React.ReactElement> {
  const [{ periodId: rawPeriodId }, { returnTo }] = await Promise.all([params, searchParams]);
  const periodId = parseUuidQueryParam(rawPeriodId);

  if (!periodId) {
    notFound();
  }

  const user = await requireInstitutionalUser();

  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ENROLLMENT_PERIOD_UPDATE)) {
    return <InstitutionalAccessDenied description="No tenés permisos para editar períodos de inscripción." />;
  }

  const period = await fetchEnrollmentPeriod(user.institutionId, periodId, AcademicScope.INSTITUTIONAL);

  if (!period) {
    notFound();
  }

  const destination = getSafeReturnTo(returnTo, "/enrollment-periods");

  return (
    <PlatformPageShell
      title="Editar período de inscripción"
      breadcrumb={<InstitutionalBreadcrumb hiddenSegments={[periodId]} />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <EnrollmentPeriodForm
        initialInstitution={{ id: user.institutionId, name: "" }}
        period={period}
        returnTo={destination}
        scope={AcademicScope.INSTITUTIONAL}
      />
    </PlatformPageShell>
  );
}
