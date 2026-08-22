import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import type { ResetInstitutionalPasswordInput } from "@features/institutional-auth/types/reset-institutional-password-input.types";

export async function resetInstitutionalPassword(
  input: ResetInstitutionalPasswordInput,
): Promise<{ success: true } | { success: false; error: BackendError }> {
  try {
    const response = await fetch(new URL("/api/v1/auth/password-recovery/reset", getApiUrlOrThrow()), {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) return { success: false, error: (await response.json()) as BackendError };

    return { success: true };
  } catch {
    return { success: false, error: { status: 500, message: "No se pudo conectar con el servidor." } };
  }
}


