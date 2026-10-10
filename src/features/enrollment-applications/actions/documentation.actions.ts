"use server";

import { revalidatePath } from "next/cache";

import { z } from "zod";

import { getResponseErrorActionState } from "@common/utils/action-state.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { DOCUMENT_MESSAGES } from "@features/enrollment-applications/constants/documentation.constants";
import { parseDocumentRequirementForm } from "@features/enrollment-applications/schemas/document-requirement.schema";
import type { DocumentActionState } from "@features/enrollment-applications/types/document-action-state.types";

const context = z.object({
  scope: z.enum(["admin", "institutional"]),
  applicationId: z.string().uuid(),
});

export async function mutateDocument(
  scope: string,
  applicationId: string,
  operation: string,
  targetId: string,
  _previous: DocumentActionState,
  form: FormData,
): Promise<DocumentActionState> {
  const parsed = context
    .extend({ operation: z.enum(["upload", "withdraw", "review"]), targetId: z.string().uuid() })
    .safeParse({ scope, applicationId, operation, targetId });

  if (!parsed.success) {
    return { error: DOCUMENT_MESSAGES.invalid };
  }

  const input = parsed.data;

  let path = `/api/v1/enrollment-applications/${input.applicationId}/attachments`;

  let options: RequestInit;

  if (input.operation === "upload") {
    const file = form.get("file");

    if (
      !(file instanceof File) ||
      file.size === 0 ||
      file.size > 10 * 1024 * 1024 ||
      !["application/pdf", "image/jpeg", "image/png"].includes(file.type)
    ) {
      return { error: DOCUMENT_MESSAGES.file };
    }

    const body = new FormData();

    body.set("file", file);
    body.set("requirementId", input.targetId);
    options = { method: "POST", body };
  } else if (input.operation === "withdraw") {
    path += `/${input.targetId}`;
    options = { method: "DELETE" };
  } else {
    const review = z
      .object({ status: z.enum(["ACCEPTED", "OBSERVED"]), observation: z.string().max(2000) })
      .safeParse({ status: form.get("status"), observation: form.get("observation") ?? "" });

    if (!review.success) {
      return { error: DOCUMENT_MESSAGES.invalid };
    }

    if (review.data.status === "OBSERVED" && !review.data.observation.trim()) {
      return { error: DOCUMENT_MESSAGES.note };
    }

    path += `/${input.targetId}/review`;
    options = {
      method: "POST",
      body: JSON.stringify(review.data),
      headers: { "Content-Type": "application/json" },
    };
  }

  const error = await getResponseErrorActionState(academicApiFetch(input.scope, path, options), [], DOCUMENT_MESSAGES.failed);

  if (error) {
    return error;
  }

  revalidatePath("/", "layout");

  return { success: true };
}

export async function saveDocumentRequirement(
  scope: string,
  institutionId: string,
  pathId: string,
  id: string | null,
  _previous: DocumentActionState,
  form: FormData,
): Promise<DocumentActionState> {
  const args = z
    .object({
      scope: z.enum(["admin", "institutional"]),
      institutionId: z.string().uuid(),
      pathId: z.string().uuid(),
      id: z.string().uuid().nullable(),
    })
    .safeParse({ scope, institutionId, pathId, id });

  const request = parseDocumentRequirementForm(form);

  if (!args.success || !request.success) {
    return { error: DOCUMENT_MESSAGES.invalid };
  }

  const input = args.data;

  const path = `${getAcademicApiBase(input.scope, input.institutionId)}/training-paths/${input.pathId}/document-requirements${input.id ? `/${input.id}` : ""}`;

  const error = await getResponseErrorActionState(
    academicApiFetch(input.scope, path, {
      method: input.id ? "PUT" : "POST",
      body: JSON.stringify(request.data),
      headers: { "Content-Type": "application/json" },
    }),
    [],
    DOCUMENT_MESSAGES.failed,
  );

  if (error) {
    return error;
  }

  revalidatePath("/", "layout");

  return { success: true };
}
