import { BookPlusIcon } from "lucide-react";

import { formatDisplayDate } from "@common/utils/date-input.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { fetchStudyPlan, fetchStudyPlans } from "@features/academic/services/academic.service";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { STUDY_PLAN_STATUS } from "@features/academic/types/study-plan-status.types";
import { deletionFilter, toOptions } from "@features/academic/utils/academic-collection-filters.util";
import { studyPlanStatusLabels } from "@features/academic/utils/academic-labels.util";
import { STUDY_PLAN_SORT_FIELDS } from "@features/academic/utils/academic-pagination.util";

export const studyPlanCollectionConfig: AcademicCollectionConfig = {
  resource: AcademicResource.STUDY_PLAN,
  title: "Planes de estudio",
  createLabel: "Nuevo plan de estudio",
  createIcon: BookPlusIcon,
  singular: "plan de estudio",
  plural: "planes de estudio",
  columns: {
    primaryLabel: "Nombre",
    detailLabels: ["Trayecto formativo", "Vigente desde", "Vigente hasta"],
    sortableFields: [STUDY_PLAN_SORT_FIELDS[0], undefined, STUDY_PLAN_SORT_FIELDS[1], STUDY_PLAN_SORT_FIELDS[2]],
  },
  searchPlaceholder: "Buscar por nombre, código o trayecto formativo...",
  hasCurriculum: true,
  canRead: (access) => access.studyPlanRead,
  canCreate: (access) => access.studyPlanCreate,
  canDelete: (access) => access.studyPlanDelete,
  canUpdate: (access) => access.studyPlanUpdate,
  canChangeStatus: (access) => access.studyPlanStatusUpdate,
  canRestore: (access) => access.studyPlanRestore,
  fetchPage: ({ scope, global, institutionId, page, size, search, sort, status, trainingPathId, validOn, deleted }) =>
    fetchStudyPlans(scope, global ? undefined : institutionId, {
      deleted,
      page,
      institutionId: global ? institutionId : undefined,
      size,
      search,
      sort: serializeSpringSort(sort),
      status: STUDY_PLAN_STATUS.find((value) => value === status),
      trainingPathId,
      validOn,
    }),
  fetchDetail: fetchStudyPlan,
  getTitle: (item) => (item as Extract<AcademicCollection, { trainingPathId: string; effectiveFrom: string | null }>).name,
  filters: ({ status, deleted }) => [
    {
      defaultValue: "all",
      label: "Estado",
      name: "status",
      options: [{ value: "all", label: "Todos" }, ...toOptions(studyPlanStatusLabels)],
      value: status ?? "all",
    },
    deletionFilter(deleted),
  ],
  dateFilters: ({ validOn }) => [{ label: "Vigente en", name: "validOn", value: validOn }],
  toRow: (item) => {
    const plan = item as Extract<AcademicCollection, { trainingPathId: string; effectiveFrom: string | null }>;
    return {
      id: plan.id,
      institutionId: plan.institutionId,
      institutionName: plan.institutionName,
      primaryValue: plan.name,
      detailValues: [plan.trainingPathName, formatDisplayDate(plan.effectiveFrom, "Sin definir"), formatDisplayDate(plan.effectiveTo, "Sin definir")],
      status: studyPlanStatusLabels[plan.status],
      active: plan.status === "ACTIVE",
      effectiveFrom: plan.effectiveFrom,
      statusValue: plan.status,
      deletedAt: plan.deletedAt ?? null,
    };
  },
};
