import { cookies } from "next/headers";

import {
  PLATFORM_ACCESS_TOKEN_COOKIE,
  PLATFORM_REFRESH_TOKEN_COOKIE,
} from "@/lib/auth-cookies";

export type PlatformAccount = {
  platformAccountId: string;
  email: string;
  name: string;
  lastName: string;
};

export type PlatformLoginResult = {
  account: PlatformAccount;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
};

type BackendError = {
  status: number;
  message: string;
};

const apiUrl = process.env.BOERO_API_URL ?? "http://localhost:8080";

function getBackendMessage(payload: unknown, fallback: string) {
  if (typeof payload === "object" && payload !== null && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallback;
}

export async function loginPlatformAccount(input: { email: string; password: string }): Promise<PlatformLoginResult> {
  const response = await fetch(`${apiUrl}/api/v1/auth/platform/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = (await response.json()) as PlatformLoginResult | BackendError;

  if (!response.ok) {
    throw new Error(getBackendMessage(payload, "No pudimos iniciar sesión."));
  }

  return payload as PlatformLoginResult;
}

export async function setPlatformAuthCookies(tokens: PlatformLoginResult["tokens"]) {
  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(PLATFORM_ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set(PLATFORM_REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function getPlatformAccount(): Promise<PlatformAccount | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) {
    return null;
  }

  const response = await fetch(`${apiUrl}/api/v1/auth/platform/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as { account: PlatformAccount };

  return payload.account;
}
