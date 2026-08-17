import { PlusIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Button } from "@common/components/ui/button";
import { AcademicCollectionView } from "@features/academic/components/academic-collection";
import type { AcademicTableColumns } from "@features/academic/config/academic-collection.config";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { TrainingPath } from "@features/academic/types/training-path.types";
import type { AcademicSearchParams } from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

type TrainingPathStudyPlansProps = {
  access: AcademicAccess;
  basePath: string;
  institutionId: string;
  scope: AcademicScope;
  searchParams: AcademicSearchParams;
  trainingPath: TrainingPath;
};

const STUDY_PLAN_CONTEXT_COLUMNS: AcademicTableColumns = {
  primaryLabel: "Nombre",
  detailLabels: ["Vigente desde", "Vigente hasta"],
  sortableFields: ["name", "effectiveFrom", "effectiveTo"],
};

export async function TrainingPathStudyPlans({
  access,
  basePath,
  institutionId,
  scope,
  searchParams,
  trainingPath,
}: TrainingPathStudyPlansProps): Promise<React.ReactElement> {
  const createHref = `${basePath}/${AcademicResource.STUDY_PLAN}/new?trainingPathId=${encodeURIComponent(trainingPath.id)}`;

  return (
    <section aria-labelledby="training-path-study-plans-title" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="training-path-study-plans-title" className="text-xl font-semibold tracking-tight">
            Planes de estudio
          </h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Versiones curriculares asociadas a este trayecto formativo.
          </p>
        </div>
        {access.studyPlanCreate ? (
          <Button asChild size="lg">
            <ReturnToLink href={createHref}>
              <PlusIcon data-icon="inline-start" />
              Nuevo plan de estudio
            </ReturnToLink>
          </Button>
        ) : null}
      </header>

      <AcademicCollectionView
        basePath={basePath}
        canCreate={access.studyPlanCreate}
        canDelete={access.studyPlanDelete}
        canChangeStatus={access.studyPlanStatusUpdate}
        canUpdate={access.studyPlanUpdate}
        canRestore={access.studyPlanRestore}
        columns={STUDY_PLAN_CONTEXT_COLUMNS}
        fixedTrainingPathId={trainingPath.id}
        institutionId={institutionId}
        resource={AcademicResource.STUDY_PLAN}
        scope={scope}
        searchParams={searchParams}
      />
    </section>
  );
}
