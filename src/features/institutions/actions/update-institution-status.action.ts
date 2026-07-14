"use server";

import { revalidatePath } from "next/cache";

import { getBackendMessage } from "@common/utils/get-backend-message.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

type UpdateInstitutionStatusActionState = {
  success?: boolean;
  error?: string;
};

const INSTITUTIONS_PATH = "/platform/institutions";

export async function updateInstitutionStatusAction(
  id: string,
  nextActive: boolean,
): Promise<UpdateInstitutionStatusActionState> {
  const fallbackMessage = `Error al ${nextActive ? "activar" : "desactivar"} la institución.`;
  const response = await platformApiFetch(`/api/v1/platform/institutions/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ active: nextActive }),
  });

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      return { error: fallbackMessage };
    }

    return { error: getBackendMessage(payload, fallbackMessage) };
  }

  revalidatePath(INSTITUTIONS_PATH);
  revalidatePath(`${INSTITUTIONS_PATH}/${id}`);
  revalidatePath(`${INSTITUTIONS_PATH}/${id}/edit`);
  return { success: true };
}
