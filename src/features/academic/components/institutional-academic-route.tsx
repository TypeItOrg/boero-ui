import type { Metadata } from "next";

import { AcademicRouteView, type AcademicBreadcrumbOptions } from "@features/academic/components/academic-route-view";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { InstitutionalAcademicPageProps } from "@features/academic/types/institutional-academic-page-props.types";
import { getAcademicAccess } from "@features/academic/utils/academic-access.util";
import { getAcademicBreadcrumbLabels } from "@features/academic/utils/academic-breadcrumb.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { InstitutionalBreadcrumb } from "@features/institutional-auth/components/institutional-breadcrumb";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getInstitutionalMetadata } from "@features/institutional-auth/utils/institutional-metadata.util";

export function getInstitutionalAcademicMetadata(resource: AcademicCollectionResource): Promise<Metadata> {
  return getInstitutionalMetadata(ACADEMIC_COLLECTION_CONFIG[resource].title);
}

export async function renderInstitutionalAcademicRoute(
  resource: AcademicCollectionResource,
  { params, searchParams }: InstitutionalAcademicPageProps,
): Promise<React.ReactElement> {
  const [user, resolvedParams, resolvedSearchParams] = await Promise.all([
    requireInstitutionalUser(),
    params,
    searchParams,
  ]);
  const segments = [resource, ...(resolvedParams.segments ?? [])];

  return (
    <AcademicRouteView
      access={getAcademicAccess(user)}
      institutionId={user.institutionId}
      renderBreadcrumb={(options: AcademicBreadcrumbOptions = {}) => (
        <InstitutionalBreadcrumb
          hiddenSegments={options.hiddenSegments}
          segmentLabels={{
            ...getAcademicBreadcrumbLabels(segments),
            ...options.segmentLabels,
          }}
          segmentHrefs={options.segmentHrefs}
        />
      )}
      scope={AcademicScope.INSTITUTIONAL}
      segments={segments}
      searchParams={resolvedSearchParams}
    />
  );
}
