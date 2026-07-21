"use server";

import { revalidatePath } from "next/cache";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function deletePlatformRoleAction(institutionId: string, roleId: string): Promise<{ error?: string }> {
  const error = await getResponseErrorActionState(
    platformApiFetch(`/api/v1/admin/institutions/${institutionId}/roles/${roleId}`, { method: "DELETE" }),
    [],
    "No se pudo eliminar el rol.",
  );
  if (error) return error;
  revalidatePath("/admin/roles");
  return {};
}
