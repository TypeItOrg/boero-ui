import type { ReactNode } from "react";

import { ActiveAcademicStatusButton } from "@features/academic/components/active-academic-status-dialog";
import { CourseDetailStatusActions } from "@features/academic/components/course-status-dialog";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { type RouteDetailInput } from "@features/academic/types/academic-route-detail-input.types";
import { isDetailStatusResource } from "@features/academic/utils/academic-detail-status-resource.util";
import { hasActiveAcademicStatus } from "@features/academic/utils/has-active-academic-status.util";

export function getAcademicDetailStatusAction({
  input,
  config,
  item,
  detailPath,
  deactivationBlocked,
}: {
  input: RouteDetailInput;
  config: AcademicCollectionConfig;
  item: AcademicCollection;
  detailPath: string;
  deactivationBlocked: boolean;
}): ReactNode {
  const currentResource = input.resource;
  const academicSpaceStatusBlocked =
    currentResource === AcademicResource.ACADEMIC_SPACE && hasActiveAcademicStatus(item) && item.active && deactivationBlocked;
  let statusAction: ReactNode;

  if (currentResource === AcademicResource.COURSE) {
    const course = item as import("@features/academic/types/course.types").Course;
    const courseStatus = (course.status ??
      (course.active ? "ACTIVE" : "INACTIVE")) as import("@features/academic/types/course-status.types").CourseStatus;

    if (config.canChangeStatus(input.access) && courseStatus !== "CLOSED") {
      statusAction = (
        <CourseDetailStatusActions
          courseStatus={courseStatus}
          id={item.id}
          institutionId={input.institutionId}
          resourceLabel={config.getTitle(item)}
          returnTo={detailPath}
          scope={input.scope}
        />
      );
    }
  } else if (config.canChangeStatus(input.access) && isDetailStatusResource(currentResource) && hasActiveAcademicStatus(item)) {
    statusAction = (
      <ActiveAcademicStatusButton
        active={item.active}
        disabled={academicSpaceStatusBlocked}
        id={item.id}
        institutionId={input.institutionId}
        resource={currentResource}
        resourceLabel={config.getTitle(item)}
        returnTo={detailPath}
        scope={input.scope}
      />
    );
  }

  return statusAction;
}
