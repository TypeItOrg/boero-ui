import "server-only";

import { BookPlusIcon, CalendarPlusIcon, LibraryBigIcon, Music2Icon, RouteIcon, type LucideIcon } from "lucide-react";

import type { PaginatedResponse } from "@common/types/paginated-response.types";
import type {
  DataTableDateFilter,
  DataTableSelectFilter,
  DataTableYearFilter,
} from "@common/components/ui/data-table-filters";
import { formatDisplayDate } from "@common/utils/date-input.util";
import { serializeSpringSort } from "@common/utils/sort-query.util";
import {
  fetchAcademicSpace,
  fetchAcademicSpaces,
  fetchAcademicYear,
  fetchAcademicYears,
  fetchInstrument,
  fetchInstruments,
  fetchStudyPlan,
  fetchStudyPlans,
  fetchTrainingPath,
  fetchTrainingPaths,
} from "@features/academic/services/academic.service";
import type { AcademicAccess } from "@features/academic/types/academic-access.types";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { ACADEMIC_YEAR_STATUS } from "@features/academic/types/academic-year-status.types";
import { STUDY_PLAN_STATUS } from "@features/academic/types/study-plan-status.types";
import {
  academicSpaceTypeLabels,
  academicYearStatusLabels,
  studyPlanStatusLabels,
} from "@features/academic/utils/academic-labels.util";
import {
  ACADEMIC_YEAR_SORT_FIELDS,
  STUDY_PLAN_SORT_FIELDS,
  TRAINING_PATH_SORT_FIELDS,
  type AcademicPaginationParams,
  type AcademicSortField,
} from "@features/academic/utils/academic-pagination.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getMaxAcademicYear, MIN_ACADEMIC_YEAR } from "@features/academic/utils/academic-year.util";

export type AcademicTableRow = {
  id: string;
  primaryValue: string;
  detailValues: readonly string[];
  status: string;
  active: boolean;
  effectiveFrom?: string | null;
  statusValue?: string;
};

export type AcademicTableColumns = {
  primaryLabel: string;
  detailLabels: readonly string[];
  sortableFields?: readonly (AcademicSortField | undefined)[];
};

type FetchInput = AcademicPaginationParams & { institutionId: string; scope: AcademicScope };

export type AcademicCollectionConfig = {
  canChangeStatus: (access: AcademicAccess) => boolean;
  canCreate: (access: AcademicAccess) => boolean;
  canRead: (access: AcademicAccess) => boolean;
  canUpdate: (access: AcademicAccess) => boolean;
  columns: AcademicTableColumns;
  createLabel: string;
  createIcon: LucideIcon;
  dateFilters?: (params: AcademicPaginationParams) => readonly DataTableDateFilter[];
  description: string;
  fetchDetail: (scope: AcademicScope, institutionId: string, id: string) => Promise<AcademicCollection | null>;
  fetchPage: (input: FetchInput) => Promise<PaginatedResponse<AcademicCollection>>;
  filters: (params: AcademicPaginationParams) => readonly DataTableSelectFilter[];
  getTitle: (item: AcademicCollection) => string;
  hasCurriculum?: boolean;
  plural: string;
  resource: AcademicCollectionResource;
  searchable?: boolean;
  searchPlaceholder?: string;
  singular: string;
  title: string;
  toRow: (item: AcademicCollection) => AcademicTableRow;
  yearFilters?: (params: AcademicPaginationParams) => readonly DataTableYearFilter[];
};

const ACTIVE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
] as const;

export const ACADEMIC_COLLECTION_CONFIG: Record<AcademicCollectionResource, AcademicCollectionConfig> = {
  [AcademicResource.ACADEMIC_YEAR]: {
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
    description: "Calendario académico de la institución.",
    searchPlaceholder: "Buscar por año, fecha o estado...",
    canRead: (access) => access.yearRead,
    canCreate: (access) => access.yearCreate,
    canUpdate: (access) => access.yearUpdate,
    canChangeStatus: (access) => access.yearStatusUpdate,
    fetchPage: ({ scope, institutionId, page, search, size, sort, status, year, startDate, endDate, validOn }) =>
      fetchAcademicYears(scope, institutionId, {
        endDate,
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
    getTitle: (item) => String((item as Extract<AcademicCollection, { year: number }>).year),
    filters: ({ status }) => [
      {
        defaultValue: "all",
        label: "Estado",
        name: "status",
        options: [{ value: "all", label: "Todos" }, ...toOptions(academicYearStatusLabels)],
        value: status ?? "all",
      },
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
      const year = item as Extract<AcademicCollection, { year: number }>;
      return {
        id: year.id,
        primaryValue: String(year.year),
        detailValues: [
          formatDisplayDate(year.startDate, "Sin definir"),
          formatDisplayDate(year.endDate, "Sin definir"),
        ],
        status: academicYearStatusLabels[year.status],
        active: year.status === "ACTIVE",
        statusValue: year.status,
      };
    },
  },
  [AcademicResource.TRAINING_PATH]: activeResource({
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
    description: "Carreras, orientaciones y recorridos formativos.",
    canRead: (access) => access.trainingPathRead,
    canCreate: (access) => access.trainingPathCreate,
    canUpdate: (access) => access.trainingPathUpdate,
    canChangeStatus: (access) => access.trainingPathStatusUpdate,
    fetchPage: ({ scope, institutionId, page, size, search, sort, active }) =>
      fetchTrainingPaths(scope, institutionId, {
        active,
        page,
        search,
        size,
        sort: serializeSpringSort(sort),
      }),
    fetchDetail: fetchTrainingPath,
  }),
  [AcademicResource.STUDY_PLAN]: {
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
    description: "Versiones curriculares y sus estados de vigencia.",
    hasCurriculum: true,
    canRead: (access) => access.studyPlanRead,
    canCreate: (access) => access.studyPlanCreate,
    canUpdate: (access) => access.studyPlanUpdate,
    canChangeStatus: (access) => access.studyPlanStatusUpdate,
    fetchPage: ({ scope, institutionId, page, size, search, sort, status, trainingPathId, validOn }) =>
      fetchStudyPlans(scope, institutionId, {
        page,
        size,
        search,
        sort: serializeSpringSort(sort),
        status: STUDY_PLAN_STATUS.find((value) => value === status),
        trainingPathId,
        validOn,
      }),
    fetchDetail: fetchStudyPlan,
    getTitle: (item) => (item as Extract<AcademicCollection, { trainingPathId: string }>).name,
    filters: ({ status }) => [
      {
        defaultValue: "all",
        label: "Estado",
        name: "status",
        options: [{ value: "all", label: "Todos" }, ...toOptions(studyPlanStatusLabels)],
        value: status ?? "all",
      },
    ],
    dateFilters: ({ validOn }) => [{ label: "Vigente en", name: "validOn", value: validOn }],
    toRow: (item) => {
      const plan = item as Extract<AcademicCollection, { trainingPathId: string }>;
      return {
        id: plan.id,
        primaryValue: plan.name,
        detailValues: [
          plan.trainingPathName,
          formatDisplayDate(plan.effectiveFrom, "Sin definir"),
          formatDisplayDate(plan.effectiveTo, "Sin definir"),
        ],
        status: studyPlanStatusLabels[plan.status],
        active: plan.status === "ACTIVE",
        effectiveFrom: plan.effectiveFrom,
        statusValue: plan.status,
      };
    },
  },
  [AcademicResource.ACADEMIC_SPACE]: {
    resource: AcademicResource.ACADEMIC_SPACE,
    title: "Espacios académicos",
    createLabel: "Nuevo espacio académico",
    createIcon: LibraryBigIcon,
    singular: "espacio académico",
    plural: "espacios académicos",
    columns: { primaryLabel: "Nombre", detailLabels: ["Tipo"] },
    description: "Catálogo de asignaturas, talleres y seminarios.",
    canRead: (access) => access.academicSpaceRead,
    canCreate: (access) => access.academicSpaceCreate,
    canUpdate: (access) => access.academicSpaceUpdate,
    canChangeStatus: (access) => access.academicSpaceStatusUpdate,
    fetchPage: ({ scope, institutionId, page, size, search, active, type }) =>
      fetchAcademicSpaces(scope, institutionId, { page, size, search, active, type }),
    fetchDetail: fetchAcademicSpace,
    getTitle: (item) => (item as Extract<AcademicCollection, { type: string }>).name,
    filters: ({ active, type }) => [
      activeFilter(active),
      {
        defaultValue: "all",
        label: "Tipo",
        name: "type",
        options: [{ value: "all", label: "Todos" }, ...toOptions(academicSpaceTypeLabels)],
        value: type ?? "all",
      },
    ],
    toRow: (item) => {
      const space = item as Extract<AcademicCollection, { type: string }>;
      return {
        id: space.id,
        primaryValue: space.name,
        detailValues: [academicSpaceTypeLabels[space.type]],
        status: space.active ? "Activo" : "Inactivo",
        active: space.active,
      };
    },
  },
  [AcademicResource.INSTRUMENT]: activeResource({
    resource: AcademicResource.INSTRUMENT,
    title: "Instrumentos",
    createLabel: "Nuevo instrumento",
    createIcon: Music2Icon,
    singular: "instrumento",
    plural: "instrumentos",
    columns: { primaryLabel: "Nombre", detailLabels: ["Descripción"] },
    description: "Catálogo institucional de instrumentos.",
    canRead: (access) => access.instrumentRead,
    canCreate: (access) => access.instrumentCreate,
    canUpdate: (access) => access.instrumentUpdate,
    canChangeStatus: (access) => access.instrumentStatusUpdate,
    fetchPage: ({ scope, institutionId, page, size, search, active }) =>
      fetchInstruments(scope, institutionId, { page, size, search, active }),
    fetchDetail: fetchInstrument,
  }),
};

function activeResource(
  config: Omit<AcademicCollectionConfig, "filters" | "getTitle" | "toRow">,
): AcademicCollectionConfig {
  return {
    ...config,
    getTitle: (item) => (item as Extract<AcademicCollection, { active: boolean }>).name,
    filters: ({ active }) => [activeFilter(active)],
    toRow: (item) => {
      const activeItem = item as Extract<AcademicCollection, { active: boolean }>;
      return {
        id: activeItem.id,
        primaryValue: activeItem.name,
        detailValues: [activeItem.description || "Sin descripción"],
        status: activeItem.active ? "Activo" : "Inactivo",
        active: activeItem.active,
      };
    },
  };
}

function activeFilter(active: boolean | undefined): DataTableSelectFilter {
  return {
    defaultValue: "all",
    label: "Estado",
    name: "active",
    options: ACTIVE_OPTIONS,
    value: active === undefined ? "all" : String(active),
  };
}

function toOptions(labels: Record<string, string>): { value: string; label: string }[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}
