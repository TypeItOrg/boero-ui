"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function deleteInstitutionRoleAction(institutionId: string, roleId: string): Promise<{ error?: string }> {
  const error = await getResponseErrorActionState(
    institutionalApiFetch(`/api/v1/institutions/${institutionId}/roles/${roleId}`, { method: "DELETE" }),
    [],
    "No se pudo eliminar el rol.",
  );
  if (error) return error;
  revalidatePath("/roles");
  return {};
}
