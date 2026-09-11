import { createAuthRequestHeaders } from "@common/utils/auth-request-headers.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import type { InstitutionalLoginResult } from "@features/institutional-auth/types/institutional-login-result.types";
import type { InstitutionalPasswordLoginInput } from "@features/institutional-auth/types/institutional-password-login-input.types";
import type { PasswordLoginInstitutionalOutput } from "@features/institutional-auth/types/password-login-institutional-output.types";

export async function passwordLoginInstitutionalAccount(
  input: InstitutionalPasswordLoginInput,
  requestHeaders: Pick<Headers, "get">,
): Promise<PasswordLoginInstitutionalOutput> {
  try {
    const response = await fetch(new URL("/api/v1/auth/login/password", getApiUrlOrThrow()), {
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
