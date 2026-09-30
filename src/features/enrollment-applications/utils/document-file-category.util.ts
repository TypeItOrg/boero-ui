import { DOCUMENT_FILE_CATEGORIES } from "@features/enrollment-applications/constants/documentation.constants";

export function formatDocumentFileCategories(formats: readonly string[]): string {
  const labels = DOCUMENT_FILE_CATEGORIES.filter((category) => category.formats.some((format) => formats.includes(format))).map(
    (category) => category.label,
  );

  return labels.length > 0 ? labels.join(", ") : "Tipos de archivo no especificados";
}
