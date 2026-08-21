import type { AcademicCollection } from "@features/academic/types/academic-collection.types";

export function hasActiveAcademicStatus(item: AcademicCollection): item is Extract<AcademicCollection, { active: boolean }> {
  return "active" in item;
}
