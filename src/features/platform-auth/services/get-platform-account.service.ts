import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { getPlatformAccessToken } from "@features/platform-auth/services/get-platform-access-token.service";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

async function fetchPlatformAccount(): Promise<PlatformAccount | null> {
  const accessToken = await getPlatformAccessToken();

  if (!accessToken) return null;

  const response = await fetch(new URL("/api/v1/admin/auth/me", getApiUrlOrThrow()), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (response.status === 401) return null;

  const payload = await parseHttpResponse<unknown>(response, "No se pudo validar la sesión de plataforma.");
  if (!isPlatformAccountPayload(payload)) {
    throw new Error("La respuesta de sesión de plataforma no tiene el formato esperado.");
  }

  return payload.account;
}

export const getPlatformAccount = cache(fetchPlatformAccount);

export async function requirePlatformAccount(): Promise<PlatformAccount> {
  const account = await getPlatformAccount();
  if (!account) redirect("/admin/auth/login");

  return account;
}

function isPlatformAccountPayload(value: unknown): value is { account: PlatformAccount } {
  if (!value || typeof value !== "object" || !("account" in value)) return false;

  const account = value.account;
  if (!account || typeof account !== "object") return false;
  const accountRecord = account as Record<string, unknown>;

  return ["platformAccountId", "email", "name", "lastName"].every((key) => typeof accountRecord[key] === "string");
}
