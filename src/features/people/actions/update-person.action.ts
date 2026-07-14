"use server";

import { revalidatePath } from "next/cache";
import { getResponseErrorActionState, getValidationActionState } from "@common/utils/action-state.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { assignPersonRoleAction } from "./assign-person-role.action";
import { revokePersonRoleAction } from "./revoke-person-role.action";
import { personRoleCodesSchema } from "../schemas/person-role.schema";
import { updatePersonFormSchema } from "../schemas/person-form.schema";
import { fetchPersonRoles } from "../services/fetch-person-roles.service";
import { PERSON_FORM_FIELD_NAMES, type PersonActionState } from "../types/person-action-state.types";
import type { SystemRoleCode } from "../types/person-role.types";

export async function updatePersonAction(
  institutionId: string,
  personId: string,
  formData: FormData,
): Promise<PersonActionState> {
  const roleCodes = parseRoleCodes(formData.get("roleCodes"));
  if (roleCodes === null) {
    return { error: "La configuración de roles no es válida." };
  }

  const payload = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email") || "",
    phoneNumber: formData.get("phoneNumber") || "",
  };

  const parsed = updatePersonFormSchema.safeParse(payload);
  if (!parsed.success) {
    return getValidationActionState(parsed.error.issues, PERSON_FORM_FIELD_NAMES);
  }

  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/people/${personId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    return getResponseErrorActionState(response, PERSON_FORM_FIELD_NAMES, "Error al actualizar el usuario.");
  }

  if (roleCodes) {
    const roleError = await syncPersonRoles(institutionId, personId, roleCodes);
    if (roleError) {
      revalidatePersonPaths(institutionId, personId);
      return { error: roleError };
    }
  }

  revalidatePersonPaths(institutionId, personId);
  return { success: true };
}

function parseRoleCodes(value: FormDataEntryValue | null): SystemRoleCode[] | null | undefined {
  if (value === null || typeof value !== "string") return undefined;

  try {
    const parsed = personRoleCodesSchema.safeParse(JSON.parse(value));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

async function syncPersonRoles(
  institutionId: string,
  personId: string,
  desiredRoleCodes: readonly SystemRoleCode[],
): Promise<string | undefined> {
  let currentRoles;

  try {
    currentRoles = await fetchPersonRoles(institutionId, personId);
  } catch {
    return "No se pudieron verificar los roles actuales del usuario.";
  }

  const currentRoleCodes = new Set(currentRoles.map((role) => role.roleCode));
  const desiredRoleCodeSet = new Set(desiredRoleCodes);

  for (const roleCode of desiredRoleCodes) {
    if (currentRoleCodes.has(roleCode)) continue;

    const result = await assignPersonRoleAction(institutionId, personId, roleCode);
    if (!result.success) {
      return result.error ?? "No se pudo asignar uno de los roles seleccionados.";
    }
  }

  for (const role of currentRoles) {
    if (desiredRoleCodeSet.has(role.roleCode)) continue;

    const result = await revokePersonRoleAction(institutionId, personId, role.roleCode);
    if (!result.success) {
      return result.error ?? "No se pudo revocar uno de los roles seleccionados.";
    }
  }

  return undefined;
}

function revalidatePersonPaths(institutionId: string, personId: string): void {
  revalidatePath(`/platform/institutions/${institutionId}/people`);
  revalidatePath(`/platform/institutions/${institutionId}/people/${personId}`);
}
