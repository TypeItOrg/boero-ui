import { parseUuidQueryParam } from "@common/utils/query-param.util";
import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import { AcademicPageIcon } from "@features/academic/components/academic-shell";
import { PlatformAcademicCreateButton } from "@features/academic/components/platform-academic-create-button";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { FULL_ACADEMIC_ACCESS } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { fetchInstitution } from "@features/institutions/services/fetch-institution.service";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export async function PlatformAcademicCollectionPage({
  resource,
  searchParams,
}: {
  resource: AcademicCollectionResource;
  searchParams: AcademicSearchParams;
}): Promise<React.ReactElement> {
  const config = ACADEMIC_COLLECTION_CONFIG[resource];
  const institutionId = parseUuidQueryParam(searchParams.institutionId);
  const institution = institutionId ? await fetchInstitution(institutionId) : null;

  return (
    <PlatformPageShell title={config.title} breadcrumb={<PlatformBreadcrumb />} actions={<AcademicPageIcon icon={config.createIcon} />}>
      <AcademicCollectionView
        basePath="/admin"
        canChangeStatus={config.canChangeStatus(FULL_ACADEMIC_ACCESS)}
        canCreate={false}
        canDelete={config.canDelete(FULL_ACADEMIC_ACCESS)}
        canRestore={config.canRestore(FULL_ACADEMIC_ACCESS)}
        canUpdate={config.canUpdate(FULL_ACADEMIC_ACCESS)}
        createAction={<PlatformAcademicCreateButton label={config.createLabel} resource={resource} />}
        global
        institutionName={institution?.name}
        resource={resource}
        scope={AcademicScope.ADMIN}
        searchParams={searchParams}
      />
    </PlatformPageShell>
  );
}
