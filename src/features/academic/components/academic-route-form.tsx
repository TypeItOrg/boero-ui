import { notFound } from "next/navigation";

import { getQueryParamValue, parseUuidQueryParam } from "@common/utils/query-param.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { AcademicResourceForm } from "@features/academic/components/academic-resource-form";
import { AcademicPageIcon, AcademicShell } from "@features/academic/components/academic-shell";
import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { fetchTrainingPath } from "@features/academic/services/academic.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type RouteFormInput = {
  access: AcademicAccess;
  basePath: string;
  breadcrumb: React.ReactNode;
  institutionId: string;
  resource: AcademicCollectionResource;
  scope: AcademicScope;
  searchParams: Record<string, string | string[] | undefined>;
};

export async function renderPrimaryForm(input: RouteFormInput): Promise<React.ReactElement> {
  ensureCreateAccess(input.access, input.resource);
  const collectionPath = `${input.basePath}/${input.resource}`;
  const returnTo = getSafeReturnTo(input.searchParams.returnTo, collectionPath);
  const contextualTrainingPath = await getContextualTrainingPath(input);
  const config = ACADEMIC_COLLECTION_CONFIG[input.resource];
  return (
    <AcademicShell
      title={`Nuevo ${config.singular}`}
      breadcrumb={input.breadcrumb}
      minViewportHeight
      headerClassName="flex-row items-center justify-between"
      actionsClassName="self-stretch"
      actions={<AcademicPageIcon icon={config.createIcon} />}
    >
      <AcademicResourceForm
        scope={input.scope}
        institutionId={input.institutionId}
        initialValues={
          contextualTrainingPath ? { trainingPathId: contextualTrainingPath.id, trainingPathName: contextualTrainingPath.name } : undefined
        }
        parentId={contextualTrainingPath?.id}
        resource={input.resource}
        returnTo={returnTo}
        trainingPathLocked={contextualTrainingPath !== undefined}
      />
    </AcademicShell>
  );
}

async function getContextualTrainingPath(input: RouteFormInput): Promise<TrainingPath | undefined> {
  if (input.resource !== AcademicResource.STUDY_PLAN) return undefined;

  const rawTrainingPathId = getQueryParamValue(input.searchParams.trainingPathId);
  if (rawTrainingPathId === undefined) return undefined;

  const trainingPathId = parseUuidQueryParam(rawTrainingPathId);
  if (!trainingPathId) notFound();

  const trainingPath = await fetchTrainingPath(input.scope, input.institutionId, trainingPathId);
  if (!trainingPath) notFound();

  return trainingPath;
}

function ensureCreateAccess(access: AcademicAccess, resource: AcademicCollectionResource): void {
  if (!ACADEMIC_COLLECTION_CONFIG[resource].canCreate(access)) notFound();
}
