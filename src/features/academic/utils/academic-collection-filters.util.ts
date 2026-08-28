import type { DataTableSelectFilter } from "@common/components/ui/data-table-filters";
import type { AcademicCollectionConfig } from "@features/academic/types/academic-collection-config.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";

export const ACTIVE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "true", label: "Activos" },
  { value: "false", label: "Inactivos" },
] as const;

export function activeFilter(active: boolean | undefined): DataTableSelectFilter {
  return {
    defaultValue: "all",
    label: "Estado",
    name: "active",
    options: ACTIVE_OPTIONS,
    value: active === undefined ? "all" : String(active),
  };
}

export function deletionFilter(deleted: boolean): DataTableSelectFilter {
  return {
    defaultValue: "false",
    label: "Registros",
    name: "deleted",
    options: [
      { value: "false", label: "Vigentes" },
      { value: "true", label: "Eliminados" },
    ],
    value: String(deleted),
  };
}

export function toOptions(labels: Record<string, string>): { value: string; label: string }[] {
  return Object.entries(labels).map(([value, label]) => ({ value, label }));
}

export function activeResource(config: Omit<AcademicCollectionConfig, "filters" | "getTitle" | "toRow">): AcademicCollectionConfig {
  return {
    ...config,
    getTitle: (item) => (item as Extract<AcademicCollection, { description: string | null; name: string }>).name,
    filters: ({ active, deleted }) => [activeFilter(active), deletionFilter(deleted)],
    toRow: (item) => {
      const activeItem = item as Extract<AcademicCollection, { description: string | null; name: string }>;
      return {
        id: activeItem.id,
        institutionId: activeItem.institutionId,
        institutionName: activeItem.institutionName,
        primaryValue: activeItem.name,
        detailValues: [activeItem.description || "Sin descripción"],
        status: activeItem.active ? "Activo" : "Inactivo",
        active: activeItem.active,
        deletedAt: activeItem.deletedAt ?? null,
      };
    },
  };
}
