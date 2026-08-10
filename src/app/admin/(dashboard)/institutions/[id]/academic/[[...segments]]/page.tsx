import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AcademicRouteView, type AcademicBreadcrumbOptions } from "@features/academic/components/academic-route-view";
import { FULL_ACADEMIC_ACCESS } from "@features/academic/types/academic-access.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicBreadcrumbLabels } from "@features/academic/utils/academic-breadcrumb.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export const metadata: Metadata = { title: "Gestión académica" };

export default async function AdminAcademicPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<React.ReactElement> {
  const [, resolvedParams, resolvedSearchParams] = await Promise.all([requirePlatformAccount(), params, searchParams]);
  const institution = await fetchInstitution(resolvedParams.id);
  if (!institution) notFound();

  return (
    <AcademicRouteView
      access={FULL_ACADEMIC_ACCESS}
      renderBreadcrumb={(options: AcademicBreadcrumbOptions = {}) => (
        <PlatformBreadcrumb
          hiddenSegments={options.hiddenSegments}
          segmentLabels={{
            [resolvedParams.id]: institution.name,
            ...getAcademicBreadcrumbLabels(resolvedParams.segments),
            ...options.segmentLabels,
          }}
          segmentHrefs={options.segmentHrefs}
        />
      )}
      institutionId={resolvedParams.id}
      scope={AcademicScope.ADMIN}
      segments={resolvedParams.segments}
      searchParams={resolvedSearchParams}
    />
  );
}
