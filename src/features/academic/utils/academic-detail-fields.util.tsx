import type { ReactNode } from "react";

import { Badge } from "@common/components/ui/badge";
import { formatDisplayDate } from "@common/utils/date-input.util";
import type { AcademicCollectionResource } from "@features/academic/types/academic-collection-resource.types";
import type { AcademicCollection } from "@features/academic/types/academic-collection.types";
import type { AcademicSpace } from "@features/academic/types/academic-space.types";
import type { AcademicYear } from "@features/academic/types/academic-year.types";
import { AcademicResource } from "@features/academic/types/academic-resource.types";
import { academicSpaceFormatLabels, academicSpaceTypeLabels, academicYearStatusLabels } from "@features/academic/utils/academic-labels.util";
import { hasActiveAcademicStatus } from "@features/academic/utils/has-active-academic-status.util";

export type AcademicDetailInfo = {
  status: string;
  active: boolean;
  description: string;
  gridColsClass?: string;
  fields: { label: string; value: ReactNode; className?: string }[];
};

export function getAcademicDetailInfo(
  resource: Exclude<AcademicCollectionResource, AcademicResource.STUDY_PLAN | AcademicResource.COURSE>,
  item: AcademicCollection,
): AcademicDetailInfo {
  switch (resource) {
    case AcademicResource.ACADEMIC_YEAR: {
      if (!isAcademicYear(item)) return unsupportedDetailResource(resource);
      return {
        status: academicYearStatusLabels[item.status],
        active: item.status === "ACTIVE",
        description: "Consultá las fechas de vigencia y el estado del ciclo lectivo.",
        gridColsClass: "sm:grid-cols-3",
        fields: [
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.status === "ACTIVE" ? "success" : "secondary"}>
                {academicYearStatusLabels[item.status]}
              </Badge>
            ),
          },
          { label: "Inicio", value: formatDisplayDate(item.startDate, "Sin definir") },
          { label: "Finalización", value: formatDisplayDate(item.endDate, "Sin definir") },
        ],
      };
    }
    case AcademicResource.ACADEMIC_SPACE: {
      if (!isAcademicSpace(item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        description: "Consultá los datos generales y el estado del espacio académico.",
        gridColsClass: "sm:grid-cols-3",
        fields: [
          { label: "Tipo", value: academicSpaceTypeLabels[item.type] },
          { label: "Formato", value: academicSpaceFormatLabels[item.format] },
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.active ? "success" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          {
            label: "Descripción",
            value: item.description || "Sin descripción",
            className: "sm:col-span-3",
          },
        ],
      };
    }
    case AcademicResource.TRAINING_PATH: {
      if (!hasActiveAcademicStatus(item) || !("description" in item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        description: "Consultá los datos generales y el estado del trayecto formativo.",
        gridColsClass: "sm:grid-cols-2",
        fields: [
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.active ? "success" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          { label: "Descripción", value: item.description || "Sin descripción" },
        ],
      };
    }
    case AcademicResource.INSTRUMENT: {
      if (!hasActiveAcademicStatus(item) || !("description" in item)) return unsupportedDetailResource(resource);
      return {
        status: item.active ? "Activo" : "Inactivo",
        active: item.active,
        description: "Consultá los datos generales y el estado del instrumento.",
        gridColsClass: "sm:grid-cols-2",
        fields: [
          {
            label: "Estado",
            value: (
              <Badge key="status" variant={item.active ? "success" : "secondary"}>
                {item.active ? "Activo" : "Inactivo"}
              </Badge>
            ),
          },
          { label: "Descripción", value: item.description || "Sin descripción" },
        ],
      };
    }
  }
}

function isAcademicYear(item: AcademicCollection): item is AcademicYear {
  return "year" in item;
}

function isAcademicSpace(item: AcademicCollection): item is AcademicSpace {
  return "type" in item;
}

function unsupportedDetailResource(resource: AcademicCollectionResource): never {
  throw new Error(`Unsupported academic detail resource: ${resource}.`);
}
