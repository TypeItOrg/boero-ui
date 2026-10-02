"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { documentDefinitionSchema } from "@features/document-catalog/schemas/document-catalog.schema";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import type { DocumentDefinition } from "@features/document-catalog/types/document-definition.types";
export async function saveDocumentDefinition(
  scope: AcademicScope,
  institutionId: string,
  id: string | undefined,
  previous: DocumentCatalogActionState,
  form: FormData,
): Promise<DocumentCatalogActionState> {
  if (
    !z.enum(["admin", "institutional"]).safeParse(scope).success ||
    !z.uuid().safeParse(institutionId).success ||
    (id !== undefined && !z.uuid().safeParse(id).success)
  ) {
    return { error: "Contexto inválido." };
  }
  const progress = z
    .object({
      document: z.object({ id: z.uuid(), institutionId: z.uuid(), revision: z.number().int().min(0) }).optional(),
      uncertain: z.boolean().optional(),
    })
    .safeParse(previous);
  if (
    !progress.success ||
    (progress.data.document && (progress.data.document.institutionId !== institutionId || (id !== undefined && progress.data.document.id !== id)))
  ) {
    return { error: "Contexto de guardado inválido. Recargá el formulario." };
  }
  if (previous.uncertain) {
    return { ...previous, error: "No se pudo confirmar el guardado anterior. Recargá el catálogo antes de reintentar." };
  }
  const auth = await authorizeAcademicAction(scope, institutionId, INSTITUTIONAL_PERMISSION.DOCUMENT_CATALOG_MANAGE);
  if (auth) {
    return auth;
  }
  let assignments: unknown;
  try {
    assignments = JSON.parse(String(form.get("assignments") ?? "[]"));
  } catch {
    return { error: "Revisá las asignaciones." };
  }
  const active = z.enum(["true", "false"]).safeParse(form.get("active"));
  const rawRevision = form.get("revision");
  const revision = rawRevision === "" || rawRevision === null ? undefined : z.string().regex(/^\d+$/).transform(Number).safeParse(rawRevision);
  const input = documentDefinitionSchema.safeParse({
    name: form.get("name"),
    instructions: form.get("instructions"),
    allowedFormats: form.getAll("allowedFormats"),
    active: active.success ? active.data === "true" : undefined,
    revision: progress.data.document?.revision ?? (typeof revision === "object" && revision.success ? revision.data : undefined),
    assignments,
  });
  if (!input.success) {
    return { error: "Revisá el nombre, los formatos y la configuración de los trayectos." };
  }
  const effectiveId = id ?? progress.data.document?.id;
  let response: Response | undefined;
  const pending = academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/document-definitions${effectiveId ? "/" + effectiveId : ""}`, {
    method: effectiveId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input.data),
  }).then((value) => {
    response = value;
    return value;
  });
  const error = await getResponseErrorActionState(pending, [], "No se pudo guardar la documentación. Tus datos siguen en el formulario.");
  if (error) {
    return { ...error, document: previous.document, uncertain: !response || response.status >= 500 };
  }
  let result: { document: DocumentDefinition; affectedTrainingPaths: number; affectedDrafts: number };
  try {
    result = (await (await pending).json()) as { document: DocumentDefinition; affectedTrainingPaths: number; affectedDrafts: number };
    if (!z.object({ id: z.uuid(), revision: z.number().int().min(0) }).safeParse(result.document).success) {
      return { error: "No se pudo confirmar el resultado. Recargá el catálogo.", uncertain: true };
    }
  } catch {
    return { error: "No se pudo confirmar el resultado. Recargá el catálogo.", uncertain: true };
  }
  revalidatePath(scope === "admin" ? "/admin/documentation" : "/documentation");
  return { success: true, ...result };
}
