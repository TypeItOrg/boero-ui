import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import type { InstitutionalRegisterInput } from "@features/institutional-auth/types/institutional-register-input.types";
import type { InstitutionalRegisterResult } from "@features/institutional-auth/types/institutional-register-result.types";
import type { RegisterInstitutionalOutput } from "@features/institutional-auth/types/register-institutional-output.types";

export async function registerInstitutionalAccount(input: InstitutionalRegisterInput): Promise<RegisterInstitutionalOutput> {
  try {
    const response = await fetch(new URL("/api/v1/auth/register", getApiUrlOrThrow()), {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json()) as BackendError;
      return { success: false, error };
    }

    return { success: true, data: (await response.json()) as InstitutionalRegisterResult };
  } catch {
    return {
      success: false,
      error: { status: 500, message: "No se pudo conectar con el servidor." },
    };
  }
}
