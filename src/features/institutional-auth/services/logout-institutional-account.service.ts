import "server-only";

import { publicApiFetch } from "@common/services/public-api-fetch.service";

import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";

export async function logoutInstitutionalAccount(): Promise<void> {
  try {
    const accessToken = await getInstitutionalAccessToken();

    if (!accessToken) {
      return;
    }

    await publicApiFetch("/api/v1/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    // The local session is cleared by the server action even when the API is unavailable.
  }
}
