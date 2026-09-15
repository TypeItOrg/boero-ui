import { CalendarRangeIcon } from "lucide-react";

import type { QueryParamValue } from "@common/types/query-param.types";
import { parseUuidQueryParam } from "@common/utils/query-param.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { EnrollmentPeriodForm } from "@features/enrollment-periods/components/enrollment-period-form";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageIcon } from "@features/platform-auth/components/platform-page-icon";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export const metadata = {
  title: "Nuevo período de inscripción",
  description: "Creá un período de inscripción para una institución.",
};

export default async function NewEnrollmentPeriodPage({
  searchParams,
}: {
  searchParams: Promise<{ institutionId?: QueryParamValue; returnTo?: QueryParamValue }>;
}): Promise<React.ReactElement> {
  const query = await searchParams;
  const institutionId = parseUuidQueryParam(query.institutionId);
  const institution = institutionId ? await fetchInstitution(institutionId) : null;
  const returnTo = getSafeReturnTo(query.returnTo, "/admin/enrollment-periods");

  return (
    <PlatformPageShell
      title="Nuevo período de inscripción"
      breadcrumb={<PlatformBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<PlatformPageIcon icon={CalendarRangeIcon} />}
    >
      <EnrollmentPeriodForm
        initialInstitution={institution ? { id: institution.id, name: institution.name } : undefined}
        returnTo={returnTo}
        scope={AcademicScope.ADMIN}
      />
    </PlatformPageShell>
  );
}
