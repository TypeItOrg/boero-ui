"use server";

import { revalidatePath } from "next/cache";

import { getBackendMessage } from "@common/utils/get-backend-message.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

type UpdatePlatformAccountStatusState = {
  success?: boolean;
  error?: string;
};

const PLATFORM_ACCOUNTS_PATH = "/platform/accounts";

export async function updatePlatformAccountStatusAction(
  id: string,
  enabled: boolean,
): Promise<UpdatePlatformAccountStatusState> {
  const fallbackMessage = `No se pudo ${enabled ? "habilitar" : "deshabilitar"} al administrador.`;
  const response = await platformApiFetch(`/api/v1/platform/accounts/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled }),
  });

  if (!response.ok) {
    let payload: unknown;

    try {
      payload = await response.json();
    } catch {
      return { error: fallbackMessage };
    }

    return { error: getBackendMessage(payload, fallbackMessage) };
  }

  revalidatePath(PLATFORM_ACCOUNTS_PATH);
  revalidatePath(`${PLATFORM_ACCOUNTS_PATH}/${id}`);
  return { success: true };
}
