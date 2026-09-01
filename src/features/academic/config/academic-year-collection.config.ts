import { CalendarPlusIcon } from "lucide-react";

import { formatDisplayDate } from "@common/utils/date-input.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import { fetchAcademicYear, fetchAcademicYears } from "@features/academic/services/academic.service";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { deletionFilter, toOptions } from "@features/academic/utils/academic-collection-filters.util";
import { academicYearStatusLabels } from "@features/academic/utils/academic-labels.util";
import { ACADEMIC_YEAR_SORT_FIELDS } from "@features/academic/utils/academic-pagination.util";
import { getMaxAcademicYear, MIN_ACADEMIC_YEAR } from "@features/academic/utils/academic-year.util";

export const academicYearCollectionConfig: AcademicCollectionConfig = {
  resource: AcademicResource.ACADEMIC_YEAR,
  title: "Ciclos lectivos",
  createLabel: "Nuevo ciclo lectivo",
  createIcon: CalendarPlusIcon,
  singular: "ciclo lectivo",
  plural: "ciclos lectivos",
  columns: {
    primaryLabel: "Año",
    detailLabels: ["Fecha de inicio", "Fecha de finalización"],
    sortableFields: ACADEMIC_YEAR_SORT_FIELDS,
  },
  searchPlaceholder: "Buscar por año, fecha o estado...",
  canRead: (access) => access.yearRead,
  canCreate: (access) => access.yearCreate,
  canDelete: (access) => access.yearDelete,
  canUpdate: (access) => access.yearUpdate,
  canChangeStatus: (access) => access.yearStatusUpdate,
  canRestore: (access) => access.yearRestore,
  fetchPage: ({ scope, global, institutionId, page, search, size, sort, status, year, startDate, endDate, validOn, deleted }) =>
    fetchAcademicYears(scope, global ? undefined : institutionId, {
      deleted,
      endDate,
      institutionId: global ? institutionId : undefined,
      page,
      search,
      size,
      sort: serializeSpringSort(sort),
      startDate,
      status: ACADEMIC_YEAR_STATUS.find((value) => value === status),
      validOn,
      year,
    }),
  fetchDetail: fetchAcademicYear,
  getTitle: (item) => String((item as Extract<AcademicCollection, { startDate: string | null }>).year),
  filters: ({ status, deleted }) => [
    {
      defaultValue: "all",
      label: "Estado",
      name: "status",
      options: [{ value: "all", label: "Todos" }, ...toOptions(academicYearStatusLabels)],
      value: status ?? "all",
    },
    deletionFilter(deleted),
  ],
  yearFilters: ({ year }) => [
    {
      defaultValue: "all",
      label: "Año",
      maxYear: getMaxAcademicYear(),
      minYear: MIN_ACADEMIC_YEAR,
      name: "year",
      value: year ? String(year) : "all",
    },
  ],
  dateFilters: ({ validOn }) => [{ label: "Vigente en", name: "validOn", value: validOn }],
  toRow: (item) => {
    const year = item as Extract<AcademicCollection, { startDate: string | null }>;
    return {
      id: year.id,
      institutionId: year.institutionId,
      institutionName: year.institutionName,
      primaryValue: String(year.year),
      detailValues: [formatDisplayDate(year.startDate, "Sin definir"), formatDisplayDate(year.endDate, "Sin definir")],
      status: academicYearStatusLabels[year.status],
      active: year.status === "ACTIVE",
      statusValue: year.status,
      deletedAt: year.deletedAt ?? null,
    };
  },
};
