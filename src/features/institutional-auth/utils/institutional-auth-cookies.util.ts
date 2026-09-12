import { cookies } from "next/headers";

import type { InstitutionalLoginResult } from "@features/institutional-auth/types/institutional-login-result.types";

type InstitutionalAuthCookieOptions = {
  httpOnly: true;
  maxAge: number;
  path: "/";
  sameSite: "lax";
  secure: boolean;
};

export const INSTITUTIONAL_ACCESS_TOKEN_COOKIE = "institutional_access_token";
export const INSTITUTIONAL_REFRESH_TOKEN_COOKIE = "institutional_refresh_token";
export const INSTITUTIONAL_EMAIL_VERIFIED_COOKIE = "institutional_email_verified";
export const INSTITUTIONAL_PASSWORD_CHANGED_COOKIE = "institutional_password_changed";
export const INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE = 60 * 15;
export const INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7;
export const INSTITUTIONAL_REMEMBER_ME_MAX_AGE = 60 * 60 * 24 * 30;
export const INSTITUTIONAL_EMAIL_VERIFIED_MAX_AGE = 15;
export const INSTITUTIONAL_PASSWORD_CHANGED_MAX_AGE = 5;

export function getInstitutionalAuthCookieOptions(maxAge: number): InstitutionalAuthCookieOptions {
  return {
    httpOnly: true,
    maxAge,
    path: "/",
    sameSite: "lax",
    secure: process.env.AUTH_COOKIE_SECURE === "true" || (process.env.AUTH_COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production"),
  };
}

export async function setInstitutionalAuthCookies(tokens: InstitutionalLoginResult["tokens"], rememberMe: boolean): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(INSTITUTIONAL_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...getInstitutionalAuthCookieOptions(INSTITUTIONAL_ACCESS_TOKEN_MAX_AGE),
  });
  cookieStore.set(INSTITUTIONAL_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...getInstitutionalAuthCookieOptions(rememberMe ? INSTITUTIONAL_REMEMBER_ME_MAX_AGE : INSTITUTIONAL_REFRESH_TOKEN_MAX_AGE),
  });
}

export async function clearInstitutionalAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(INSTITUTIONAL_ACCESS_TOKEN_COOKIE);
  cookieStore.delete(INSTITUTIONAL_REFRESH_TOKEN_COOKIE);
}

export async function setInstitutionalEmailVerifiedCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(INSTITUTIONAL_EMAIL_VERIFIED_COOKIE, "true", getInstitutionalAuthCookieOptions(INSTITUTIONAL_EMAIL_VERIFIED_MAX_AGE));
}

export async function hasInstitutionalEmailVerifiedCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(INSTITUTIONAL_EMAIL_VERIFIED_COOKIE)?.value === "true";
}

export async function setInstitutionalPasswordChangedCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(INSTITUTIONAL_PASSWORD_CHANGED_COOKIE, "true", getInstitutionalAuthCookieOptions(INSTITUTIONAL_PASSWORD_CHANGED_MAX_AGE));
}

export async function hasInstitutionalPasswordChangedCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  return cookieStore.get(INSTITUTIONAL_PASSWORD_CHANGED_COOKIE)?.value === "true";
}

export async function clearInstitutionalLoginFlashCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(INSTITUTIONAL_EMAIL_VERIFIED_COOKIE);
  cookieStore.delete(INSTITUTIONAL_PASSWORD_CHANGED_COOKIE);
}
