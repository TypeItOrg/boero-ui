import { createHttpError } from "@common/utils/create-http-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { SystemRoleList } from "../types/person-role.types";

export async function fetchSystemRoles(): Promise<SystemRoleList> {
  const response = await platformApiFetch("/api/v1/roles/system");

  if (!response.ok) {
    throw createHttpError("No se pudieron obtener los roles del sistema", response.status);
  }

  return response.json();
}
