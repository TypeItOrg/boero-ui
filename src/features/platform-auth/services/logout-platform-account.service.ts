import "server-only";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";
import { clearPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";

export async function logoutPlatformAccount(): Promise<void> {
  const accessToken = await getPlatformAccessToken();

  if (!accessToken) return;

  try {
    await fetch(new URL("/api/v1/admin/auth/logout", getApiUrlOrThrow()), {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    await clearPlatformAuthCookies();
  }
}
