"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { INVALID_ACTION_ARGUMENTS } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { RoleFormState } from "@features/roles/types/role-form-state.types";

const fields = ["name"] as const;
const schema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre.").max(100, "El nombre no puede superar los 100 caracteres."),
  permissions: z.array(z.string()),
});
const actionContextSchema = z.object({
  institutionId: z.string().uuid(),
  roleId: z.string().uuid().optional(),
});

export async function saveInstitutionRoleAction(
  institutionId: string,
  roleId: string | undefined,
  returnTo: string | undefined,
  _state: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const context = actionContextSchema.safeParse({ institutionId, roleId });
  if (!context.success) return { error: INVALID_ACTION_ARGUMENTS };

  const parsed = schema.safeParse({
    name: formData.get("name"),
    permissions: formData.getAll("permissions").filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, fields);

  const path = `/api/v1/institutions/${context.data.institutionId}/roles${context.data.roleId ? `/${context.data.roleId}` : ""}`;
  const error = await getResponseErrorActionState(
    institutionalApiFetch(path, {
      method: context.data.roleId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }),
    fields,
    "No se pudo guardar el rol.",
  );
  if (error) return error;

  const destination = getSafeReturnTo(returnTo, context.data.roleId ? `/roles/${context.data.roleId}` : "/roles");
  revalidatePath("/roles");
  redirect(destination);
}
