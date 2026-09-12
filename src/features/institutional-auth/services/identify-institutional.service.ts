import { createAuthRequestHeaders } from "@common/utils/auth-request-headers.util";
import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import type { BackendError } from "@common/types/backend-error.types";
import type { IdentifyInstitutionalOutput } from "@features/institutional-auth/types/identify-institutional-output.types";
import type { InstitutionalIdentifyInput } from "@features/institutional-auth/types/institutional-identify-input.types";
import type { InstitutionalIdentifyResult } from "@features/institutional-auth/types/institutional-identify-result.types";

export async function identifyInstitutionalAccount(
  input: InstitutionalIdentifyInput,
  requestHeaders: Pick<Headers, "get">,
): Promise<IdentifyInstitutionalOutput> {
  try {
    const response = await fetch(new URL("/api/v1/auth/login/identify", getApiUrlOrThrow()), {
      body: JSON.stringify(input),
      cache: "no-store",
      headers: createAuthRequestHeaders(requestHeaders),
      method: "POST",
    });

    if (!response.ok) {
      const error = (await response.json()) as BackendError;
      return { success: false, error };
    }

    return { success: true, data: (await response.json()) as InstitutionalIdentifyResult };
  } catch {
    return {
      success: false,
      error: { status: 500, message: "No se pudo conectar con el servidor." },
    };
  }
}
