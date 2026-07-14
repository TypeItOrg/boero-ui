import "server-only";

import { cache } from "react";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

async function fetchPlatformAccount(): Promise<PlatformAccount | null> {
  const accessToken = await getPlatformAccessToken();

  if (!accessToken) return null;

  const response = await fetch(new URL("/api/v1/auth/platform/me", getApiUrlOrThrow()), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { account: PlatformAccount };
  return payload.account;
}

export const getPlatformAccount = cache(fetchPlatformAccount);
