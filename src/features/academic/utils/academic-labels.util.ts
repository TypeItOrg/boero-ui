import type { AcademicSpaceFormat } from "@features/academic/types/academic-space-format.types";
import type { AcademicSpaceType } from "@features/academic/types/academic-space-type.types";
import type { AcademicYearStatus } from "@features/academic/types/academic-year-status.types";
import type { CourseStatus } from "@features/academic/types/course-status.types";
import type { ApprovalMode } from "@features/academic/types/approval-mode.types";
import type { RequiredCondition } from "@features/academic/types/required-condition.types";
import type { RequirementStage } from "@features/academic/types/requirement-stage.types";
import type { RequirementType } from "@features/academic/types/requirement-type.types";
import type { CourseWeekDay } from "@features/academic/types/course-week-day.types";
import type { StudyPlanStatus } from "@features/academic/types/study-plan-status.types";

export const academicYearStatusLabels: Record<AcademicYearStatus, string> = {
  PLANNED: "Planificado",
  ACTIVE: "Activo",
  CLOSED: "Cerrado",
};

export const studyPlanStatusLabels: Record<StudyPlanStatus, string> = {
  DRAFT: "Borrador",
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
};

export const academicSpaceTypeLabels: Record<AcademicSpaceType, string> = {
  SUBJECT: "Asignatura",
  WORKSHOP: "Taller",
  SEMINAR: "Seminario",
  PRACTICE: "Práctica",
  OTHER: "Otro",
};

export const academicSpaceFormatLabels: Record<AcademicSpaceFormat, string> = {
  INDIVIDUAL: "Individual",
  GRUPAL: "Grupal",
};

export const requirementTypeLabels: Record<RequirementType, string> = {
  REQUIRED: "Obligatorio",
  OPTIONAL: "Optativo",
};

export const approvalModeLabels: Record<ApprovalMode, string> = {
  PROMOTION: "Promoción",
  FINAL_EXAM: "Examen final",
  PROMOTION_OR_FINAL_EXAM: "Promoción o examen final",
};

export const requirementStageLabels: Record<RequirementStage, string> = {
  TO_ENROLL: "Para cursar",
  TO_PASS: "Para aprobar",
};

export const requiredConditionLabels: Record<RequiredCondition, string> = {
  REGULAR: "Regularizada",
  PASSED: "Aprobada",
};

export const courseWeekDayLabels: Record<CourseWeekDay, string> = {
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
};

export const courseStatusLabels: Record<CourseStatus, string> = {
  ACTIVE: "Activo",
  INACTIVE: "Inactivo",
  CLOSED: "Cerrado",
};
