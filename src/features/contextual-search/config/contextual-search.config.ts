import {
  BookOpenIcon,
  Building2Icon,
  CalendarDaysIcon,
  ClockIcon,
  FileStackIcon,
  GraduationCapIcon,
  KeyRoundIcon,
  ShieldCheckIcon,
  UserRoundIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import type { AcademicContextualSearchEntity } from "@features/contextual-search/types/academic-contextual-search-entity.types";
import type { ContextualSearchEntity } from "@features/contextual-search/types/contextual-search-entity.types";

type EntityPresentation = {
  singular: string;
  plural: string;
  icon: LucideIcon;
};

export const CONTEXTUAL_SEARCH_PRESENTATION: Record<ContextualSearchEntity, EntityPresentation> = {
  institution: { singular: "Institución", plural: "Instituciones", icon: Building2Icon },
  user: { singular: "Usuario", plural: "Usuarios", icon: UserRoundIcon },
  role: { singular: "Rol", plural: "Roles", icon: ShieldCheckIcon },
  "platform-account": { singular: "Administrador", plural: "Administradores", icon: KeyRoundIcon },
  "academic-year": { singular: "Ciclo lectivo", plural: "Ciclos lectivos", icon: CalendarDaysIcon },
  "training-path": { singular: "Trayecto formativo", plural: "Trayectos formativos", icon: GraduationCapIcon },
  "study-plan": { singular: "Plan de estudio", plural: "Planes de estudio", icon: FileStackIcon },
  "academic-space": { singular: "Espacio académico", plural: "Espacios académicos", icon: BookOpenIcon },
  instrument: { singular: "Instrumento", plural: "Instrumentos", icon: WrenchIcon },
  shift: { singular: "Turno", plural: "Turnos", icon: ClockIcon },
};

export const CONTEXTUAL_SEARCH_STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  ENABLED: "Habilitado",
  DISABLED: "Deshabilitado",
  NO_ACCESS: "Sin acceso",
  PLANNED: "Planificado",
  CLOSED: "Cerrado",
  DRAFT: "Borrador",
};

export const CONTEXTUAL_SEARCH_CATEGORY_LABELS: Record<string, string> = {
  SYSTEM: "Sistema",
  CUSTOM: "Personalizado",
  SUBJECT: "Materia",
  WORKSHOP: "Taller",
  SEMINAR: "Seminario",
  PRACTICE: "Práctica",
  OTHER: "Otro",
};

const ACADEMIC_SEARCH_ENTITIES = new Set<string>([
  "academic-year",
  "training-path",
  "study-plan",
  "academic-space",
  "instrument",
  "shift",
]);

export function isAcademicSearchEntity(value: string | undefined): value is AcademicContextualSearchEntity {
  return value !== undefined && ACADEMIC_SEARCH_ENTITIES.has(value);
}

export function hasPositiveContextualSearchStatus(status: string | null): boolean {
  return status === "ACTIVE" || status === "ENABLED";
}
