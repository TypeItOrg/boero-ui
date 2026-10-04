export const COURSE_ENROLLMENT_GRADE_MESSAGES = {
  DIALOG_TITLE: "Notas de la cursada",
  STUDENT_DIALOG_TITLE: "Notas",
  ADD_GRADE: "Añadir nota",
  SAVE_GRADE: "Guardar nota",
  EDIT_GRADE: "Editar nota",
  DELETE_GRADE: "Eliminar nota",
  CANCEL_DELETION: "Deshacer eliminación",
  PUBLISH_GRADES: "Publicar notas",
  PUBLISH_GRADES_OF_CLASS: "Publicar notas de la clase",
  NO_GRADES: "Todavía no hay notas cargadas para esta cursada.",
  NO_PUBLISHED_GRADES: "Todavía no hay notas publicadas para esta materia.",
  DRAFT_SAVED: "Nota guardada como borrador.",
  CHANGES_SAVED: "Cambios guardados. Se harán visibles cuando se publiquen las notas de la clase.",
  DELETE_DRAFT_CONFIRM: "¿Eliminar este borrador? Esta acción no se puede deshacer y no afecta a los estudiantes.",
  DELETE_PUBLISHED_CONFIRM:
    "La nota seguirá visible para el estudiante hasta que se publiquen las notas de la clase.",
  PUBLISH_CONFIRM_TITLE: "Publicar notas",
  PUBLISH_SUCCESS: "Notas publicadas correctamente.",
  LOAD_FAILED: "No se pudieron cargar las notas.",
  MUTATION_FAILED: "No se pudo guardar la nota. Revisá los datos e intentá nuevamente.",
  VIEW_GRADES: "Ver notas",
} as const;

export const COURSE_ENROLLMENT_GRADE_STATUS_LABELS: Record<string, string> = {
  DRAFT: "Borrador",
  PUBLISHED: "Publicado",
  PENDING_CHANGES: "Cambios sin publicar",
  PENDING_DELETION: "Pendiente de eliminación",
};
