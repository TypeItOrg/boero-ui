import { ACADEMIC_ROUTE_SEGMENT } from "@features/academic/constants/academic-route.constants";
import { AcademicResource } from "@features/academic/types/academic-resource.types";

const NEW_LABELS: Readonly<Record<string, string>> = {
  [AcademicResource.ACADEMIC_YEAR]: "Nuevo ciclo lectivo",
  [AcademicResource.TRAINING_PATH]: "Nuevo trayecto formativo",
  [AcademicResource.STUDY_PLAN]: "Nuevo plan de estudio",
  [AcademicResource.ACADEMIC_LEVEL]: "Nuevo nivel",
  [ACADEMIC_ROUTE_SEGMENT.SPACES]: "Incorporar espacio",
  [AcademicResource.PREREQUISITE]: "Nueva correlatividad",
  [AcademicResource.ACADEMIC_SPACE]: "Nuevo espacio académico",
  [AcademicResource.INSTRUMENT]: "Nuevo instrumento",
};

export function getAcademicBreadcrumbLabels(segments: string[] | undefined): Readonly<Record<string, string>> {
  if (!segments || segments.at(-1) !== ACADEMIC_ROUTE_SEGMENT.NEW) return {};
  const parentSegment = segments.at(-2);
  const label = parentSegment ? NEW_LABELS[parentSegment] : undefined;
  return label ? { [ACADEMIC_ROUTE_SEGMENT.NEW]: label } : {};
}
