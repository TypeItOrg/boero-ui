import type { ReactElement, ReactNode } from "react";

import Link from "next/link";

import { InfoIcon } from "lucide-react";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { SectionHeader } from "@common/components/section-header";
import { Button } from "@common/components/ui/button";
import { DETAIL_LABEL_CLASS_NAME } from "@common/constants/detail-label.constants";
import { cn } from "@common/utils/cn.util";

import { AcademicSpaceUsage, AcademicSpaceUsageWarning } from "@features/academic/components/academic-space-usage";
import { CourseSummary } from "@features/academic/components/course-summary";
import { StudyPlanSpaceDetail } from "@features/academic/components/study-plan-space-detail";
import { StudyPlanSummary } from "@features/academic/components/study-plan-summary";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { AcademicSpaceUsage as AcademicSpaceUsageData } from "@features/academic/types/academic-space-usage.types";
import type { Course } from "@features/academic/types/course.types";
import type { StudyPlan } from "@features/academic/types/study-plan.types";
import { getAcademicDetailInfo } from "@features/academic/utils/academic-detail-fields.util";

export { StudyPlanSpaceDetail };

type AcademicDetailProps = {
  item: AcademicCollection;
  resource: AcademicCollectionResource;
  basePath: string;
  canEdit: boolean;
  academicSpaceUsage?: AcademicSpaceUsageData | null;
  statusAction?: ReactNode;
  versionAction?: ReactNode;
  returnTo?: string;
};

export function AcademicDetail({
  item,
  resource,
  basePath,
  canEdit,
  academicSpaceUsage,
  statusAction,
  versionAction,
  returnTo,
}: AcademicDetailProps): ReactElement {
  const destination = returnTo ?? `${basePath}/${resource}`;
  const detailPath = `${basePath}/${resource}/${item.id}`;

  const headerActions = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button asChild size="lg" variant="outline">
        <Link href={destination}>Volver</Link>
      </Button>
      {canEdit || statusAction || versionAction ? (
        <div className="flex flex-wrap items-center gap-2">
          {canEdit ? (
            <Button asChild size="lg">
              <ReturnToLink href={`${detailPath}/edit`}>Editar</ReturnToLink>
            </Button>
          ) : null}
          {versionAction}
          {statusAction}
        </div>
      ) : null}
    </div>
  );

  if (resource === AcademicResource.STUDY_PLAN) {
    return (
      <div className="flex flex-col gap-4">
        {headerActions}
        <StudyPlanSummary plan={item as StudyPlan} />
      </div>
    );
  }

  if (resource === AcademicResource.COURSE) {
    return (
      <div className="flex flex-col gap-4">
        {headerActions}
        <CourseSummary course={item as Course} />
      </div>
    );
  }

  const detail = getAcademicDetailInfo(resource, item);
  const academicSpaceWarning =
    resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage?.summary.deactivationBlocked ? (
      <AcademicSpaceUsageWarning blockingPlanCount={academicSpaceUsage.summary.activePlans + academicSpaceUsage.summary.draftPlans} />
    ) : null;

  return (
    <div className="flex flex-col gap-4">
      {headerActions}
      {academicSpaceWarning}
      <section aria-labelledby="academic-detail-info-title" className="bg-muted/25 rounded-xl border p-5 md:p-6">
        <header className="-mx-5 border-b px-5 pb-5 md:-mx-6 md:px-6">
          <SectionHeader icon={InfoIcon} title="Información" description={detail.description} titleId="academic-detail-info-title" />
        </header>
        <div className={cn("mt-5 grid gap-4", detail.gridColsClass ?? "sm:grid-cols-2")}>
          {detail.fields.map((field) => (
            <div key={field.label} className={cn("bg-background rounded-lg border p-4", field.className)}>
              <p className={DETAIL_LABEL_CLASS_NAME}>{field.label}</p>
              <div className="mt-1 font-medium">{field.value}</div>
            </div>
          ))}
        </div>
      </section>
      {resource === AcademicResource.ACADEMIC_SPACE && academicSpaceUsage ? (
        <AcademicSpaceUsage basePath={basePath} usage={academicSpaceUsage} />
      ) : null}
    </div>
  );
}
