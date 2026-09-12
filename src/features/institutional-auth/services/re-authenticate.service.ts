import { INSTITUTIONAL_AUTH_ERROR_MESSAGES } from "@features/institutional-auth/constants/error-messages.constants";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export async function reAuthenticate(password: string): Promise<void> {
  let response: Response;
  try {
    response = await institutionalApiFetch("/api/v1/auth/re-authenticate", {
      body: JSON.stringify({ password }),
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });
  } catch {
    throw new Error(INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_CONNECTION);
  }

  if (response.ok) return;
  if (response.status === 401) throw new Error(INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_INVALID_PASSWORD);
  if (response.status === 429) throw new Error(INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_RATE_LIMITED);
  throw new Error(INSTITUTIONAL_AUTH_ERROR_MESSAGES.REAUTH_UNAVAILABLE);
}
