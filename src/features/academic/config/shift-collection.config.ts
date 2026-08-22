import { ClockIcon } from "lucide-react";

import { fetchShift, fetchShifts } from "@features/academic/services/academic.service";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { activeResource } from "@features/academic/utils/academic-collection-filters.util";

export const shiftCollectionConfig: AcademicCollectionConfig = activeResource({
  resource: AcademicResource.SHIFT,
  title: "Turnos",
  createLabel: "Nuevo turno",
  createIcon: ClockIcon,
  singular: "turno",
  plural: "turnos",
  columns: { primaryLabel: "Nombre", detailLabels: ["Descripción"] },
  canRead: (access) => access.shiftRead,
  canCreate: (access) => access.shiftCreate,
  canDelete: (access) => access.shiftDelete,
  canUpdate: (access) => access.shiftUpdate,
  canChangeStatus: (access) => access.shiftStatusUpdate,
  canRestore: (access) => access.shiftRestore,
  fetchPage: ({ scope, global, institutionId, page, size, search, active, deleted }) =>
    fetchShifts(scope, global ? undefined : institutionId, {
      page,
      size,
      search,
      active,
      deleted,
      institutionId: global ? institutionId : undefined,
    }),
  fetchDetail: fetchShift,
});
