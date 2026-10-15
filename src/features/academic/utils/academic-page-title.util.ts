import { ACADEMIC_COLLECTION_CONFIG } from "@features/academic/config/academic-collection.config";
import { getAcademicBreadcrumbLabels } from "@features/academic/utils/academic-breadcrumb.util";
import { parseAcademicCollectionResource } from "@features/academic/utils/parse-academic-collection-resource.util";

export function getAcademicPageTitle(segments: string[]): string {
  const resource = parseAcademicCollectionResource(segments[0]);

  if (!resource) {
    return "Resumen académico";
  }

  const config = ACADEMIC_COLLECTION_CONFIG[resource];

  if (segments.length === 1) {
    return config.title;
  }

  const newLabel = getAcademicBreadcrumbLabels(segments).new;

  if (newLabel) {
    return newLabel;
  }

  if (segments.at(-1) === "edit") {
    if (segments.includes("prerequisites")) {
      return "Editar correlatividad";
    }

    if (segments.includes("spaces")) {
      return "Editar espacio";
    }

    if (segments.includes("academic-levels")) {
      return "Editar nivel";
    }

    return `Editar ${config.singular}`;
  }

  return segments.includes("spaces") ? "Detalle del espacio" : `Detalle de ${config.singular}`;
}
