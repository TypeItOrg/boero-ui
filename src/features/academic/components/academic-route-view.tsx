import { notFound } from "next/navigation";
import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import { AcademicOverview } from "@features/academic/components/academic-overview";
import { renderPrimaryDetail } from "@features/academic/components/academic-route-detail";
import { renderPrimaryForm } from "@features/academic/components/academic-route-form";
import { AcademicShell } from "@features/academic/components/academic-shell";
import { StudyPlanRoute } from "@features/academic/components/study-plan-route";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { canReadAcademic, type AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicBreadcrumbOptions } from "@features/academic/types/academic-breadcrumb-options.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { parseAcademicCollectionResource } from "@features/academic/utils/parse-academic-collection-resource.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicRouteBase } from "@features/academic/utils/academic-scope.util";

export type { AcademicBreadcrumbOptions };

type AcademicRouteViewProps = {
  access: AcademicAccess;
  institutionId: string;
  renderBreadcrumb: (options?: AcademicBreadcrumbOptions) => React.ReactNode;
  scope: AcademicScope;
  segments?: string[];
  searchParams: Record<string, string | string[] | undefined>;
};

export async function AcademicRouteView({
  access,
  institutionId,
  renderBreadcrumb,
  scope,
  segments = [],
  searchParams,
}: AcademicRouteViewProps): Promise<React.ReactElement> {
  const basePath = getAcademicRouteBase(scope, institutionId);
  const breadcrumb = renderBreadcrumb();
  if (segments.length === 0) {
    if (!canReadAcademic(access)) notFound();
    return <AcademicOverview access={access} basePath={basePath} breadcrumb={breadcrumb} institutionId={institutionId} scope={scope} />;
  }

  const [resourceSegment, id, action, nestedId, nestedAction, leaf, leafId] = segments;
  const collectionResource = parseAcademicCollectionResource(resourceSegment);
  if (collectionResource) {
    const config = ACADEMIC_COLLECTION_CONFIG[collectionResource];
    ensureReadAccess(access, collectionResource);
    if (!id) {
      const createAction = config.canCreate(access) ? (
        <Button asChild size="lg" className="w-full">
          <ReturnToLink href={`${basePath}/${collectionResource}/${ACADEMIC_ROUTE_SEGMENT.NEW}`}>
            <PlusIcon data-icon="inline-start" />
            {config.createLabel}
          </ReturnToLink>
        </Button>
      ) : undefined;
      return (
        <AcademicShell title={config.title} breadcrumb={breadcrumb} actions={createAction}>
          <AcademicCollectionView
            basePath={basePath}
            canCreate={config.canCreate(access)}
            canChangeStatus={config.canChangeStatus(access)}
            canDelete={config.canDelete(access)}
            canRestore={config.canRestore(access)}
            canUpdate={config.canUpdate(access)}
            institutionId={institutionId}
            resource={collectionResource}
            scope={scope}
            searchParams={searchParams}
          />
        </AcademicShell>
      );
    }
    if (id === ACADEMIC_ROUTE_SEGMENT.NEW)
      return await renderPrimaryForm({
        access,
        basePath,
        breadcrumb,
        institutionId,
        resource: collectionResource,
        scope,
        searchParams,
      });
    if (action === "status") notFound();
    const isPrimaryDetailAction = action === ACADEMIC_ROUTE_SEGMENT.EDIT;
    if (config.hasCurriculum && action && !isPrimaryDetailAction) {
      return StudyPlanRoute({
        access,
        action,
        basePath,
        breadcrumb,
        id,
        institutionId,
        leaf,
        leafId,
        nestedAction,
        nestedId,
        renderBreadcrumb,
        scope,
      });
    }
    if (collectionResource === AcademicResource.ACADEMIC_YEAR && !action) {
      notFound();
    }
    return renderPrimaryDetail({
      access,
      action,
      basePath,
      breadcrumb,
      id,
      institutionId,
      renderBreadcrumb,
      resource: collectionResource,
      scope,
      searchParams,
    });
  }
  notFound();
}

function ensureReadAccess(access: AcademicAccess, resource: AcademicCollectionResource): void {
  if (ACADEMIC_COLLECTION_CONFIG[resource].canRead(access)) return;
  notFound();
}
