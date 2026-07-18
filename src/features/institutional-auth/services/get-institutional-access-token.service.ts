import "server-only";

import { cookies } from "next/headers";

import { INSTITUTIONAL_ACCESS_TOKEN_COOKIE } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export async function getInstitutionalAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(INSTITUTIONAL_ACCESS_TOKEN_COOKIE)?.value;
}
