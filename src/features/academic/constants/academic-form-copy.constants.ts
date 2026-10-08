import { AcademicResource } from "@features/academic/types/academic-resource.types";

export const CREATE_ACTION_LABELS: Record<AcademicResource, string> = {
  [AcademicResource.ACADEMIC_YEAR]: "Crear ciclo lectivo",
  [AcademicResource.TRAINING_PATH]: "Crear trayecto formativo",
  [AcademicResource.STUDY_PLAN]: "Crear plan de estudio",
  [AcademicResource.ACADEMIC_LEVEL]: "Crear nivel",
  [AcademicResource.ACADEMIC_SPACE]: "Crear espacio académico",
  [AcademicResource.STUDY_PLAN_SPACE]: "Incorporar espacio",
  [AcademicResource.PREREQUISITE]: "Crear correlatividad",
  [AcademicResource.INSTRUMENT]: "Crear instrumento",
  [AcademicResource.COURSE]: "Crear curso",
  [AcademicResource.SHIFT]: "Crear turno",
};

export const FORM_SECTION_COPY: Record<AcademicResource, { title: string; description: string }> = {
  [AcademicResource.ACADEMIC_YEAR]: {
    title: "Datos del ciclo lectivo",
    description: "Definí el año y, si corresponde, su período de vigencia.",
  },
  [AcademicResource.TRAINING_PATH]: {
    title: "Datos del trayecto formativo",
    description: "Usá un nombre claro para identificar la carrera, orientación o recorrido.",
  },
  [AcademicResource.STUDY_PLAN]: {
    title: "Datos del plan de estudio",
    description: "Vinculá el plan con un trayecto y definí su período de vigencia.",
  },
  [AcademicResource.ACADEMIC_LEVEL]: {
    title: "Datos del nivel",
    description: "Indicá cómo se identifica y ordena dentro de la estructura curricular.",
  },
  [AcademicResource.ACADEMIC_SPACE]: {
    title: "Datos del espacio académico",
    description: "Definí el nombre, el tipo y la descripción del espacio reutilizable.",
  },
  [AcademicResource.STUDY_PLAN_SPACE]: {
    title: "Configuración curricular",
    description: "Ubicá el espacio dentro del plan y establecé sus condiciones académicas.",
  },
  [AcademicResource.PREREQUISITE]: {
    title: "Condición de correlatividad",
    description: "Seleccioná el espacio requerido y la condición que debe cumplirse.",
  },
  [AcademicResource.INSTRUMENT]: {
    title: "Datos del instrumento",
    description: "Ingresá la información con la que se identificará en el catálogo institucional.",
  },
  [AcademicResource.COURSE]: {
    title: "Datos del curso",
    description: "Instanciá un espacio académico de un plan activo, elegí el ciclo lectivo y armá sus clases.",
  },
  [AcademicResource.SHIFT]: {
    title: "Datos del turno",
    description: "Ingresá la información con la que se identificará en el catálogo institucional.",
  },
};
