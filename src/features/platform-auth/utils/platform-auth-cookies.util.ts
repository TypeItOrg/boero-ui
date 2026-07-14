import { cookies } from "next/headers";

import type { PlatformLoginResult } from "@features/platform-auth/types/platform-login-result.types";

type PlatformAuthCookieOptions = {
  httpOnly: true;
  maxAge: number;
  path: "/";
  sameSite: "lax";
  secure: boolean;
};

export const PLATFORM_ACCESS_TOKEN_COOKIE = "platform_access_token";
export const PLATFORM_REFRESH_TOKEN_COOKIE = "platform_refresh_token";
export const PLATFORM_ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const PLATFORM_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 30;

export function getPlatformAuthCookieOptions(maxAge: number): PlatformAuthCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: shouldUseSecureCookies(),
    path: "/",
    maxAge,
  };
}

function shouldUseSecureCookies(): boolean {
  if (process.env.AUTH_COOKIE_SECURE === "true") return true;
  if (process.env.AUTH_COOKIE_SECURE === "false") return false;

  return process.env.NODE_ENV === "production";
}

export async function setPlatformAuthCookies(tokens: PlatformLoginResult["tokens"]): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(PLATFORM_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...getPlatformAuthCookieOptions(PLATFORM_ACCESS_TOKEN_MAX_AGE),
  });

  cookieStore.set(PLATFORM_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...getPlatformAuthCookieOptions(PLATFORM_REFRESH_TOKEN_MAX_AGE),
  });
}

export async function clearPlatformAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(PLATFORM_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(PLATFORM_REFRESH_TOKEN_COOKIE);
}
