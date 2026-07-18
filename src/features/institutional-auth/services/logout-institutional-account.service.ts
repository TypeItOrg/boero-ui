import "server-only";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";

export async function logoutInstitutionalAccount(): Promise<void> {
  try {
    const accessToken = await getInstitutionalAccessToken();
    if (!accessToken) return;

    await fetch(new URL("/api/v1/auth/logout", getApiUrlOrThrow()), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    // The local session is cleared by the server action even when the API is unavailable.
  }
}
