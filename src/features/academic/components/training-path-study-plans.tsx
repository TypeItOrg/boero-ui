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
import { SectionHeader } from "@common/components/section-header";

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
      <header className="-mx-5 flex flex-col gap-3 border-b px-5 pb-5 sm:flex-row sm:items-center sm:justify-between md:-mx-6 md:px-6">
        <SectionHeader
          icon={BookMarkedIcon}
          title="Planes de estudio"
          description="Versiones curriculares asociadas a este trayecto formativo."
          titleId="training-path-study-plans-title"
        />
      </header>

      <AcademicCollectionView
        basePath={basePath}
        canCreate={access.studyPlanCreate}
        canDelete={access.studyPlanDelete}
        canChangeStatus={access.studyPlanStatusUpdate}
        canUpdate={access.studyPlanUpdate}
        canRestore={access.studyPlanRestore}
        columns={STUDY_PLAN_CONTEXT_COLUMNS}
        createAction={
          access.studyPlanCreate ? (
            <Button asChild size="lg" className="w-full">
              <ReturnToLink href={createHref}>
                <PlusIcon data-icon="inline-start" />
                Nuevo plan de estudio
              </ReturnToLink>
            </Button>
          ) : undefined
        }
        fixedTrainingPathId={trainingPath.id}
        institutionId={institutionId}
        resource={AcademicResource.STUDY_PLAN}
        scope={scope}
        searchParams={searchParams}
      />
    </section>
  );
}
