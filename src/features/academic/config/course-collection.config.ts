import { GraduationCapIcon } from "lucide-react";

import { serializeSpringSort } from "@common/utils/sort-query.util";
import { fetchCourse, fetchCourses } from "@features/academic/services/academic.service";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { deletionFilter, toOptions } from "@features/academic/utils/academic-collection-filters.util";
import { academicSpaceFormatLabels, academicSpaceTypeLabels, courseStatusLabels } from "@features/academic/utils/academic-labels.util";
import { COURSE_SORT_FIELDS } from "@features/academic/utils/academic-pagination.util";

export const courseCollectionConfig: AcademicCollectionConfig = {
  resource: AcademicResource.COURSE,
  title: "Cursos",
  createLabel: "Nuevo curso",
  createIcon: GraduationCapIcon,
  singular: "curso",
  plural: "cursos",
  columns: {
    primaryLabel: "Espacio académico",
    detailLabels: ["Trayecto formativo", "Plan de estudio", "Ciclo lectivo"],
    sortableFields: COURSE_SORT_FIELDS,
  },
  searchPlaceholder: "Buscar por espacio o institución...",
  canRead: (access) => access.courseRead,
  canCreate: (access) => access.courseCreate,
  canDelete: (access) => access.courseDelete,
  canUpdate: (access) => access.courseUpdate,
  canChangeStatus: (access) => access.courseStatusUpdate,
  canRestore: (access) => access.courseRestore,
  fetchPage: ({
    scope,
    global,
    institutionId,
    page,
    size,
    search,
    sort,
    active,
    courseStatus,
    academicSpaceId,
    trainingPathId,
    studyPlanId,
    year,
    deleted,
  }) => {
    const status = courseStatus ?? (active === undefined ? undefined : active ? "ACTIVE" : "INACTIVE");
    return fetchCourses(scope, global ? undefined : institutionId, {
      page,
      size,
      search,
      status: status as import("@features/academic/types/course-status.types").CourseStatus | undefined,
      academicSpaceId,
      trainingPathId,
      studyPlanId,
      year,
      deleted,
      institutionId: global ? institutionId : undefined,
      sort: serializeSpringSort(sort),
    });
  },
  fetchDetail: fetchCourse,
  getTitle: (item) => (item as Extract<AcademicCollection, { classes: unknown }>).academicSpaceName,
  filters: ({ active, courseStatus, deleted }) => {
    const status = courseStatus ?? (active === undefined ? undefined : active ? "ACTIVE" : "INACTIVE");
    return [
      {
        defaultValue: "all",
        label: "Estado",
        name: "courseStatus",
        options: [{ value: "all", label: "Todos" }, ...toOptions(courseStatusLabels)],
        value: status ?? "all",
      },
      deletionFilter(deleted),
    ];
  },
  toRow: (item) => {
    const course = item as Extract<AcademicCollection, { classes: unknown }>;
    const statusLabel = courseStatusLabels[course.status] ?? (course.active ? "Activo" : "Inactivo");
    const isActive = course.status === "ACTIVE" || (!course.status && course.active);
    const statusValue = course.status ?? (course.active ? "ACTIVE" : "INACTIVE");
    return {
      id: course.id,
      institutionId: course.institutionId,
      institutionName: course.institutionName,
      primaryValue: `${course.academicSpaceName} · ${academicSpaceTypeLabels[course.academicSpaceType]} · ${academicSpaceFormatLabels[course.academicSpaceFormat]}`,
      detailValues: [course.trainingPathName, course.studyPlanName, String(course.year)],
      status: statusLabel,
      active: isActive,
      statusValue,
      deletedAt: course.deletedAt ?? null,
    };
  },
};
