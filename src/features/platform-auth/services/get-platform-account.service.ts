import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";

import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";
import { PLATFORM_ACCESS_TOKEN_COOKIE } from "@features/platform-auth/utils/platform-auth-cookies.util";

const API_URL = process.env.BOERO_API_URL ?? "http://172.17.0.1:8080";

async function fetchPlatformAccount(): Promise<PlatformAccount | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(PLATFORM_ACCESS_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  const response = await fetch(`${API_URL}/api/v1/auth/platform/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { account: PlatformAccount };
  return payload.account;
}

export const getPlatformAccount = cache(fetchPlatformAccount);
