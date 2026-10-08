import { z } from "zod";

import type { DocumentDefinitionSaveResult } from "@features/document-catalog/types/document-definition-save-result.types";

export async function readDocumentDefinitionSaveResult(pending: Promise<Response>): Promise<DocumentDefinitionSaveResult | undefined> {
  let result: DocumentDefinitionSaveResult;

  try {
    result = (await (await pending).json()) as DocumentDefinitionSaveResult;

    if (!z.object({ id: z.uuid(), institutionId: z.uuid(), revision: z.number().int().min(0) }).safeParse(result.document).success) {
      return undefined;
    }
  } catch {
    return undefined;
  }

  return result;
}
