import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";

export function invalidActionState(): AcademicActionState {
  return { error: "La solicitud académica no tiene un formato válido." };
}
