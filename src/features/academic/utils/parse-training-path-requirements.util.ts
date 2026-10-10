import { draftsSchema } from "@features/academic/schemas/training-path-save.schema";
import type { TrainingPathDraftParseResult } from "@features/academic/types/training-path-draft-parse-result.types";

export function parseTrainingPathRequirements(form: FormData): TrainingPathDraftParseResult {
  let rawDrafts: unknown;

  const rawDocumentRequirements = form.get("documentRequirements");

  if (rawDocumentRequirements !== null && typeof rawDocumentRequirements !== "string") {
    return {
      success: false,
      state: {
        fieldErrors: {
          documentRequirements: "Revisá los documentos requeridos para la inscripción.",
        },
      },
    };
  }

  try {
    rawDrafts = JSON.parse(rawDocumentRequirements ?? "[]");
  } catch {
    return {
      success: false,
      state: {
        fieldErrors: {
          documentRequirements: "Revisá los documentos requeridos para la inscripción.",
        },
      },
    };
  }

  const drafts = draftsSchema.safeParse(rawDrafts);

  if (!drafts.success) {
    return {
      success: false,
      state: {
        fieldErrors: {
          documentRequirements: "Revisá los documentos requeridos para la inscripción.",
        },
      },
    };
  }

  if (new Set(drafts.data.map((draft) => draft.clientId)).size !== drafts.data.length) {
    return {
      success: false,
      state: {
        fieldErrors: {
          documentRequirements: "Revisá los documentos requeridos para la inscripción.",
        },
      },
    };
  }

  return { success: true, data: drafts.data };
}
