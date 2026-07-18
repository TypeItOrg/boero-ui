import "server-only";

import { cache } from "react";

import { getApiUrlOrThrow } from "@common/utils/get-api-url-or-throw.util";
import { getInstitutionalAccessToken } from "@features/institutional-auth/services/get-institutional-access-token.service";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

async function fetchInstitutionalUser(): Promise<InstitutionalUser | null> {
  try {
    const accessToken = await getInstitutionalAccessToken();
    if (!accessToken) return null;

    const response = await fetch(new URL("/api/v1/auth/me", getApiUrlOrThrow()), {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });

    if (!response.ok) return null;

    const payload = (await response.json()) as { user: InstitutionalUser };
    return payload.user;
  } catch {
    return null;
  }
}

export const getInstitutionalUser = cache(fetchInstitutionalUser);
