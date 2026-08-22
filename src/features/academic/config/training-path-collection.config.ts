import { RouteIcon } from "lucide-react";

import { serializeSpringSort } from "@common/utils/sort-query.util";
import { fetchTrainingPath, fetchTrainingPaths } from "@features/academic/services/academic.service";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { activeResource } from "@features/academic/utils/academic-collection-filters.util";
import { TRAINING_PATH_SORT_FIELDS } from "@features/academic/utils/academic-pagination.util";

export const trainingPathCollectionConfig: AcademicCollectionConfig = activeResource({
  resource: AcademicResource.TRAINING_PATH,
  title: "Trayectos formativos",
  createLabel: "Nuevo trayecto formativo",
  createIcon: RouteIcon,
  singular: "trayecto formativo",
  plural: "trayectos formativos",
  columns: {
    primaryLabel: "Nombre",
    detailLabels: ["Descripción"],
    sortableFields: TRAINING_PATH_SORT_FIELDS,
  },
  canRead: (access) => access.trainingPathRead,
  canCreate: (access) => access.trainingPathCreate,
  canDelete: (access) => access.trainingPathDelete,
  canUpdate: (access) => access.trainingPathUpdate,
  canChangeStatus: (access) => access.trainingPathStatusUpdate,
  canRestore: (access) => access.trainingPathRestore,
  fetchPage: ({ scope, institutionId, page, size, search, sort, active, deleted }) =>
    fetchTrainingPaths(scope, institutionId, {
      active,
      deleted,
      page,
      search,
      size,
      sort: serializeSpringSort(sort),
    }),
  fetchDetail: fetchTrainingPath,
});
