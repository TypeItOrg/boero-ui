"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import type { RoleFormState } from "@features/roles/types/institution-role.types";

const fields = ["name"] as const;
const schema = z.object({
  name: z.string().trim().min(1, "Ingresá un nombre.").max(100, "El nombre no puede superar los 100 caracteres."),
  permissions: z.array(z.string()),
});

export async function saveInstitutionRoleAction(
  roleId: string | undefined,
  _state: RoleFormState,
  formData: FormData,
): Promise<RoleFormState> {
  const user = await requireInstitutionalUser();
  const requiredPermission = roleId ? INSTITUTIONAL_PERMISSION.ROLE_UPDATE : INSTITUTIONAL_PERMISSION.ROLE_CREATE;
  if (!hasInstitutionalPermission(user, requiredPermission)) {
    return { error: "No tenés permisos para realizar esta acción." };
  }

  const parsed = schema.safeParse({
    name: formData.get("name"),
    permissions: formData.getAll("permissions").filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) return getValidationActionState(parsed.error.issues, fields);

  const path = `/api/v1/institutions/${user.institutionId}/roles${roleId ? `/${roleId}` : ""}`;
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

  revalidatePath("/roles");
  redirect("/roles");
}
