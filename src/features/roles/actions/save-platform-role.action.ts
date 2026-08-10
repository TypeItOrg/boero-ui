"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { PlatformRoleFormState } from "@features/roles/types/platform-role-form-state.types";

const FIELDS = ["institutionId", "name"] as const;
const SCHEMA = z.object({
  institutionId: z.string().uuid("Seleccioná una institución."),
  name: z.string().trim().min(1, "Ingresá un nombre.").max(100, "El nombre no puede superar los 100 caracteres."),
  permissions: z.array(z.string()),
});
const ACTION_CONTEXT_SCHEMA = z.object({
  roleId: z.string().uuid().optional(),
  fixedInstitutionId: z.string().uuid().optional(),
});

export async function savePlatformRoleAction(
  roleId: string | undefined,
  fixedInstitutionId: string | undefined,
  returnTo: string | undefined,
  _state: PlatformRoleFormState,
  formData: FormData,
): Promise<PlatformRoleFormState> {
  const context = ACTION_CONTEXT_SCHEMA.safeParse({ roleId, fixedInstitutionId });
  if (!context.success) return { error: INVALID_ACTION_ARGUMENTS };

  const institutionId = context.data.fixedInstitutionId ?? String(formData.get("institutionId") ?? "");
  const parsed = SCHEMA.safeParse({
    institutionId,
    name: formData.get("name"),
    permissions: formData.getAll("permissions").filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, FIELDS);

  const path = `/api/v1/admin/institutions/${parsed.data.institutionId}/roles${context.data.roleId ? `/${context.data.roleId}` : ""}`;
  const error = await getResponseErrorActionState(
    platformApiFetch(path, {
      method: context.data.roleId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: parsed.data.name, permissions: parsed.data.permissions }),
    }),
    FIELDS,
    "No se pudo guardar el rol.",
  );
  if (error) return error;

  const destination = getSafeReturnTo(
    returnTo,
    context.data.roleId ? `/admin/roles/${context.data.roleId}` : "/admin/roles",
  );
  revalidatePath("/admin/roles");
  redirect(destination);
}
