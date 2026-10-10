import type { ReactElement } from "react";

import Link from "next/link";

import { ReturnToLink } from "@common/components/navigation/return-to-link";
import { Badge } from "@common/components/ui/badge";
import { Button } from "@common/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@common/components/ui/card";

import { AcademicDeleteButton } from "@features/academic/components/academic-delete-button";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import type { StudyPlanSpace } from "@features/academic/types/study-plan-space.types";
import { approvalModeLabels, requirementTypeLabels } from "@features/academic/utils/academic-labels.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";

export function CurriculumSpaceCard({ canEditCurriculum, institutionId, planPath, scope, space }: CurriculumSpaceCardProps): ReactElement {
  const spacePath = `${planPath}/spaces/${space.id}`;

  return (
    <Card size="sm" className="bg-background h-full">
      <Link className="flex flex-1 flex-col gap-3 rounded-t-xl focus-visible:ring-2 focus-visible:outline-none" href={spacePath}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <CardTitle className="text-base font-semibold">{space.academicSpaceName}</CardTitle>
            <span className="text-muted-foreground shrink-0 text-xs">Orden {space.displayOrder}</span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Badge variant={space.requirementType === "REQUIRED" ? "default" : "outline"}>{requirementTypeLabels[space.requirementType]}</Badge>
          <Badge variant="secondary">{approvalModeLabels[space.approvalMode]}</Badge>
        </CardContent>
      </Link>
      {canEditCurriculum ? (
        <CardFooter className="justify-end gap-2">
          <Button asChild size="sm" variant="ghost">
            <ReturnToLink href={`${spacePath}/edit`} returnTo={planPath}>
              Editar
            </ReturnToLink>
          </Button>
          <AcademicDeleteButton
            destination={planPath}
            id={space.id}
            institutionId={institutionId}
            label={`el espacio “${space.academicSpaceName}”`}
            resource={AcademicResource.STUDY_PLAN_SPACE}
            scope={scope}
            size="sm"
          />
        </CardFooter>
      ) : null}
    </Card>
  );
}

export type CurriculumSpaceCardProps = {
  canEditCurriculum: boolean;
  institutionId: string;
  planPath: string;
  scope: AcademicScope;
  space: StudyPlanSpace;
};
