export const DOCUMENT_LEVEL_LABELS = {
  AT_SUBMISSION: "Obligatorio al enviar",
  BEFORE_CONFIRMATION: "Obligatorio para confirmar",
  OPTIONAL: "Opcional",
} as const;
export const DOCUMENT_STATUS_LABELS = {
  MISSING: "Pendiente de entrega",
  PENDING_REVIEW: "Pendiente de revisión",
  OBSERVED: "Observado",
  ACCEPTED: "Aceptado",
} as const;
export const DOCUMENT_FILE_CATEGORIES = [
  { value: "images", label: "Imágenes", formats: ["image/jpeg", "image/png"] },
  { value: "documents", label: "Documentos", formats: ["application/pdf"] },
] as const;
export const DOCUMENT_MESSAGES = {
  invalid: "Revisá los datos de la documentación.",
  failed: "No se pudo guardar la documentación.",
  readFailed: "No se pudo consultar la documentación.",
  file: "Seleccioná un archivo admitido de hasta 10 MiB.",
  singleFile: "Seleccioná un solo archivo.",
  refreshAfterUploadFailed: "El archivo se guardó, pero no se pudo actualizar la documentación. Usá Actualizar detalle antes de continuar.",
  note: "Indicá el motivo de la observación.",
} as const;
