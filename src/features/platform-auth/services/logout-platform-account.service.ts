import "server-only";

import { cookies } from "next/headers";

import {
  clearPlatformAuthCookies,
  PLATFORM_ACCESS_TOKEN_COOKIE,
} from "@features/platform-auth/utils/platform-auth-cookies.util";

const API_URL = process.env.BOERO_API_URL ?? "http://172.17.0.1:8080";

export async function logoutPlatformAccount(): Promise<void> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return;

  try {
    await fetch(`${API_URL}/api/v1/auth/platform/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
  } catch {
    await clearPlatformAuthCookies();
  }
}
