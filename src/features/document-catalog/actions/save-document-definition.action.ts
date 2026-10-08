"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";

import { academicApiFetch } from "@features/academic/services/academic-api-fetch.service";
import { authorizeAcademicAction } from "@features/academic/utils/academic-action-auth.util";
import type { AcademicScope } from "@features/academic/utils/academic-scope.util";
import { getAcademicApiBase } from "@features/academic/utils/academic-scope.util";
import { documentDefinitionSchema } from "@features/document-catalog/schemas/document-catalog.schema";
import type { DocumentCatalogActionState } from "@features/document-catalog/types/document-catalog-action-state.types";
import { getDocumentCatalogPageUrl } from "@features/document-catalog/utils/document-catalog-route.util";
import { readDocumentDefinitionSaveResult } from "@features/document-catalog/utils/read-document-definition-save-result.util";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";

const DOCUMENT_FIELDS = ["name", "instructions", "allowedFormats", "active", "targetInstitutionId"] as const;

export async function saveDocumentDefinition(
  scope: AcademicScope,
  institutionId: string | undefined,
  id: string | undefined,
  previous: DocumentCatalogActionState,
  form: FormData,
  returnTo?: string,
): Promise<DocumentCatalogActionState> {
  if (institutionId === undefined) {
    return { error: "Seleccioná una institución." };
  }

  if (
    !z.enum(["admin", "institutional"]).safeParse(scope).success ||
    !z.uuid().safeParse(institutionId).success ||
    (id !== undefined && !z.uuid().safeParse(id).success) ||
    (returnTo !== undefined && !z.string().safeParse(returnTo).success)
  ) {
    return { error: "Contexto inválido." };
  }

  institutionId = institutionId.toLowerCase();
  id = id?.toLowerCase();

  let destination = returnTo === undefined ? undefined : getSafeReturnTo(returnTo, getDocumentCatalogPageUrl(scope, institutionId));

  const rawCopySourceInstitutionId = form.get("copySourceInstitutionId");

  if (rawCopySourceInstitutionId !== null && rawCopySourceInstitutionId !== "") {
    const source = z.uuid().safeParse(rawCopySourceInstitutionId);

    if (!source.success || scope !== "admin" || id !== undefined || source.data.toLowerCase() === institutionId) {
      return { error: "Seleccioná una institución distinta a la del documento original." };
    }
  }

  const rawTargetInstitutionId = form.get("targetInstitutionId");

  let targetInstitutionId: string | undefined;

  if (rawTargetInstitutionId !== null && rawTargetInstitutionId !== "") {
    const target = z.uuid().safeParse(rawTargetInstitutionId);

    if (!target.success || scope !== "admin" || id === undefined) {
      return { error: "Revisá la institución de destino." };
    }

    targetInstitutionId = target.data.toLowerCase();
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

  if (rawCopySourceInstitutionId !== null && rawCopySourceInstitutionId !== "" && progress.data.document) {
    return { error: "La copia debe guardarse como un documento nuevo. Recargá el formulario." };
  }

  if (previous.uncertain) {
    return {
      ...previous,
      error: "No se pudo confirmar el guardado anterior. Recargá el catálogo antes de reintentar.",
    };
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
    const validation = getValidationActionState(input.error.issues, DOCUMENT_FIELDS);

    return {
      ...validation,
      ...(Object.keys(validation.fieldErrors ?? {}).length === 0 ? { error: "Revisá la configuración de los trayectos." } : {}),
      document: previous.document,
    };
  }

  const effectiveId = id ?? progress.data.document?.id;

  let response: Response | undefined;

  const pending = academicApiFetch(scope, `${getAcademicApiBase(scope, institutionId)}/document-definitions${effectiveId ? "/" + effectiveId : ""}`, {
    method: effectiveId ? "PUT" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input.data,
      ...(targetInstitutionId ? { targetInstitutionId } : {}),
    }),
  }).then((value) => {
    response = value;

    return value;
  });

  const error = await getResponseErrorActionState(
    pending,
    DOCUMENT_FIELDS,
    "No se pudo guardar la documentación. Tus datos siguen en el formulario.",
  );

  if (error) {
    return {
      ...error,
      document: previous.document,
      uncertain: !response || response.status >= 500,
    };
  }

  const result = await readDocumentDefinitionSaveResult(pending);

  if (!result) {
    return { error: "No se pudo confirmar el resultado. Recargá el catálogo.", uncertain: true };
  }

  const catalogPath = scope === "admin" ? "/admin/documentation" : "/documentation";

  revalidatePath(catalogPath);
  revalidatePath(`${catalogPath}/${result.document.id}`);
  revalidatePath(`${catalogPath}/${result.document.id}/edit`);

  if (destination) {
    if (scope === "admin" && result.document.institutionId !== institutionId) {
      const origin = new URL(destination, "https://return-to.invalid");

      const documentPath = `${catalogPath}/${result.document.id}`.toLowerCase();

      const destinationPath = origin.pathname.toLowerCase();

      if (destinationPath === documentPath || destinationPath === `${documentPath}/edit`) {
        origin.searchParams.set("institutionId", result.document.institutionId);
        destination = `${origin.pathname}${origin.search}`;
      }
    }

    redirect(destination);
  }

  return { success: true, ...result };
}
