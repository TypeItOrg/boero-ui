import "server-only";

import { cookies } from "next/headers";

import { PLATFORM_ACCESS_TOKEN_COOKIE } from "@features/platform-auth/utils/platform-auth-cookies.util";

export async function getPlatformAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;
}
