import { LibraryBigIcon } from "lucide-react";

import { fetchAcademicSpace, fetchAcademicSpaces } from "@features/academic/services/academic.service";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { activeFilter, deletionFilter, toOptions } from "@features/academic/utils/academic-collection-filters.util";
import { academicSpaceFormatLabels, academicSpaceTypeLabels } from "@features/academic/utils/academic-labels.util";

export const academicSpaceCollectionConfig: AcademicCollectionConfig = {
  resource: AcademicResource.ACADEMIC_SPACE,
  title: "Espacios académicos",
  createLabel: "Nuevo espacio académico",
  createIcon: LibraryBigIcon,
  singular: "espacio académico",
  plural: "espacios académicos",
  columns: { primaryLabel: "Nombre", detailLabels: ["Tipo", "Formato", "Descripción"] },
  canRead: (access) => access.academicSpaceRead,
  canCreate: (access) => access.academicSpaceCreate,
  canDelete: (access) => access.academicSpaceDelete,
  canUpdate: (access) => access.academicSpaceUpdate,
  canChangeStatus: (access) => access.academicSpaceStatusUpdate,
  canRestore: (access) => access.academicSpaceRestore,
  fetchPage: ({ scope, global, institutionId, page, size, search, active, type, format, deleted }) =>
    fetchAcademicSpaces(scope, global ? undefined : institutionId, {
      page,
      size,
      search,
      active,
      type,
      format,
      deleted,
      institutionId: global ? institutionId : undefined,
    }),
  fetchDetail: fetchAcademicSpace,
  getTitle: (item) => (item as Extract<AcademicCollection, { type: string }>).name,
  filters: ({ active, type, format, deleted }) => [
    activeFilter(active),
    {
      defaultValue: "all",
      label: "Tipo",
      name: "type",
      options: [{ value: "all", label: "Todos" }, ...toOptions(academicSpaceTypeLabels)],
      value: type ?? "all",
    },
    {
      defaultValue: "all",
      label: "Formato",
      name: "format",
      options: [{ value: "all", label: "Todos" }, ...toOptions(academicSpaceFormatLabels)],
      value: format ?? "all",
    },
    deletionFilter(deleted),
  ],
  toRow: (item) => {
    const space = item as Extract<AcademicCollection, { type: string }>;
    return {
      id: space.id,
      institutionId: space.institutionId,
      institutionName: space.institutionName,
      primaryValue: space.name,
      detailValues: [academicSpaceTypeLabels[space.type], academicSpaceFormatLabels[space.format], space.description || "Sin descripción"],
      status: space.active ? "Activo" : "Inactivo",
      active: space.active,
      deletedAt: space.deletedAt ?? null,
    };
  },
};
