import { createAuthRequestHeaders } from "@common/utils/auth-request-headers.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import type { InstitutionalLoginInput } from "@features/institutional-auth/types/institutional-login-input.types";
import type { InstitutionalLoginResult } from "@features/institutional-auth/types/institutional-login-result.types";
import type { LoginInstitutionalOutput } from "@features/institutional-auth/types/login-institutional-output.types";

export async function loginInstitutionalAccount(
  input: InstitutionalLoginInput,
  requestHeaders: Pick<Headers, "get">,
): Promise<LoginInstitutionalOutput> {
  try {
    const response = await fetch(new URL("/api/v1/auth/login", getApiUrlOrThrow()), {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: createAuthRequestHeaders(requestHeaders),
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json()) as BackendError;
      return { success: false, error };
    }

    return { success: true, data: (await response.json()) as InstitutionalLoginResult };
  } catch {
    return {
      success: false,
      error: { status: 500, message: "No se pudo conectar con el servidor." },
    };
  }
}
