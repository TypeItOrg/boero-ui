import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";
import { parseInstitutionalUser } from "@features/institutional-auth/schemas/institutional-user.schema";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

async function fetchInstitutionalUser(): Promise<InstitutionalUser | null> {
  const accessToken = await getInstitutionalAccessToken();
  if (!accessToken) return null;

  const response = await fetch(new URL("/api/v1/auth/me", getApiUrlOrThrow()), {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });

  if (response.status === 401) return null;

  const payload = await parseHttpResponse<unknown>(response, "No se pudo validar la sesión institucional.");
  return parseInstitutionalUser(payload);
}

export const getInstitutionalUser = cache(fetchInstitutionalUser);

export async function requireInstitutionalUser(): Promise<InstitutionalUser> {
  const user = await getInstitutionalUser();
  if (!user) redirect("/auth/login");

  return user;
}
