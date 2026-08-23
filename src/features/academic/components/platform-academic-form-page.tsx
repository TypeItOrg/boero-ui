import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicPageIcon } from "@features/academic/components/academic-shell";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { PlatformBreadcrumb } from "@features/platform-auth/components/platform-breadcrumb";
import { PlatformPageShell } from "@features/platform-auth/components/platform-page-shell";

export function PlatformAcademicFormPage({
  resource,
  returnTo,
}: {
  resource: AcademicCollectionResource;
  returnTo?: string | string[];
}): React.ReactElement {
  const config = ACADEMIC_COLLECTION_CONFIG[resource];
  const collectionPath = `/admin/${resource}`;

  return (
    <PlatformPageShell
      title={`Nuevo ${config.singular}`}
      breadcrumb={<PlatformBreadcrumb />}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={config.createIcon} />}
    >
      <AcademicResourceForm
        allowInstitutionSelection
        resource={resource}
        returnTo={getSafeReturnTo(returnTo, collectionPath)}
        scope={AcademicScope.ADMIN}
      />
    </PlatformPageShell>
  );
}
