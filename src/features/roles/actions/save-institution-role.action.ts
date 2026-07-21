"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { getSafeReturnTo } from "@common/utils/return-to.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { RoleFormState } from "@features/roles/types/institution-role.types";

const fields = ["name"] as const;
const schema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre.").max(100, "El nombre no puede superar los 100 caracteres."),
  permissions: z.array(z.string()),
});

export async function saveInstitutionRoleAction(
  institutionId: string,
  roleId: string | undefined,
  returnTo: string | undefined,
  _state: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    permissions: formData.getAll("permissions").filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, fields);

  const path = `/api/v1/institutions/${institutionId}/roles${roleId ? `/${roleId}` : ""}`;
  const error = await getResponseErrorActionState(
    institutionalApiFetch(path, {
      method: roleId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    }),
    fields,
    "No se pudo guardar el rol.",
  );
  if (error) return error;

  const destination = getSafeReturnTo(returnTo, roleId ? `/roles/${roleId}` : "/roles");
  revalidatePath("/roles");
  redirect(destination);
}
