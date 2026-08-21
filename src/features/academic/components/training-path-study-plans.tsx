import { BookMarkedIcon, PlusIcon } from "lucide-react";

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
    <section aria-labelledby="training-path-study-plans-title" className="bg-muted/25 flex flex-col gap-5 rounded-xl border p-5 md:p-6">
      <header className="flex flex-col gap-3 border-b pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3.5">
          <div className="bg-primary/10 text-primary flex size-11 shrink-0 items-center justify-center rounded-xl">
            <BookMarkedIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 id="training-path-study-plans-title" className="text-base font-semibold">
              Planes de estudio
            </h2>
            <p className="text-muted-foreground text-sm">Versiones curriculares asociadas a este trayecto formativo.</p>
          </div>
        </div>
        {access.studyPlanCreate ? (
          <Button asChild size="icon" className="size-11 rounded-xl" title="Nuevo plan de estudio">
            <ReturnToLink aria-label="Nuevo plan de estudio" href={createHref}>
              <PlusIcon className="size-5" />
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
