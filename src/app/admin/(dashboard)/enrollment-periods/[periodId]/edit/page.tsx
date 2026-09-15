import { notFound } from "next/navigation";
import { CalendarRangeIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { parseUuidQueryParam } from "@common/utils/query-param.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { EnrollmentPeriodForm } from "@features/enrollment-periods/components/enrollment-period-form";
import { fetchEnrollmentPeriod } from "@features/enrollment-periods/services/enrollment-period.service";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

type EditEnrollmentPeriodPageProps = {
  params: Promise<{ periodId: string }>;
  searchParams: Promise<{ institutionId?: QueryParamValue; returnTo?: QueryParamValue }>;
};

export default async function EditEnrollmentPeriodPage({ params, searchParams }: EditEnrollmentPeriodPageProps): Promise<React.ReactElement> {
  const [{ periodId: rawPeriodId }, query] = await Promise.all([params, searchParams]);
  const periodId = parseUuidQueryParam(rawPeriodId);
  const institutionId = parseUuidQueryParam(query.institutionId);

  if (!periodId || !institutionId) {
    notFound();
  }

  const [period, institution] = await Promise.all([
    fetchEnrollmentPeriod(institutionId, periodId, AcademicScope.ADMIN),
    fetchInstitution(institutionId),
  ]);

  if (!period || !institution) {
    notFound();
  }

  const collectionPath = `/admin/enrollment-periods?institutionId=${encodeURIComponent(institutionId)}`;
  const returnTo = getSafeReturnTo(query.returnTo, collectionPath);

  return (
    <PlatformPageShell
      title="Editar período de inscripción"
      breadcrumb={<PlatformBreadcrumb hiddenSegments={[periodId]} />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <EnrollmentPeriodForm
        initialInstitution={{ id: institution.id, name: institution.name }}
        period={period}
        returnTo={returnTo}
        scope={AcademicScope.ADMIN}
      />
    </PlatformPageShell>
  );
}
