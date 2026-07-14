"use server";

import { revalidatePath } from "next/cache";
import { getBackendMessage } from "@common/utils/get-backend-message.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

type DeletePersonActionState = {
  success?: boolean;
  error?: string;
};

export async function deletePersonAction(institutionId: string, personId: string): Promise<DeletePersonActionState> {
  const response = await platformApiFetch(`/api/v1/institutions/${institutionId}/people/${personId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      return { error: "Error al eliminar el usuario." };
    }

    return { error: getBackendMessage(payload, "Error al eliminar el usuario.") };
  }

  revalidatePath(`/platform/institutions/${institutionId}/people`);
  return { success: true };
}
