"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { INSTITUTIONAL_PERMISSION } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";

export async function deleteInstitutionRoleAction(roleId: string): Promise<{ error?: string }> {
  const user = await requireInstitutionalUser();
  if (!hasInstitutionalPermission(user, INSTITUTIONAL_PERMISSION.ROLE_DELETE)) {
    return { error: "No tenés permisos para eliminar roles." };
  }
  const error = await getResponseErrorActionState(
    institutionalApiFetch(`/api/v1/institutions/${user.institutionId}/roles/${roleId}`, { method: "DELETE" }),
    [],
    "No se pudo eliminar el rol.",
  );
  if (error) return error;
  revalidatePath("/roles");
  return {};
}
