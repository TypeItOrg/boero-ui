import "server-only";

import { cookies } from "next/headers";

import { GUARDIAN_WORKSPACE_COOKIE, GUARDIAN_WORKSPACE_MAX_AGE } from "@features/guardian-workspace/constants/guardian-workspace.constants";

function getCookieOptions(): {
  httpOnly: true;
  maxAge: number;
  path: "/";
  sameSite: "lax";
  secure: boolean;
} {
  return {
    httpOnly: true,
    maxAge: GUARDIAN_WORKSPACE_MAX_AGE,
    path: "/",
    sameSite: "lax",
    secure: process.env.AUTH_COOKIE_SECURE === "true" || (process.env.AUTH_COOKIE_SECURE !== "false" && process.env.NODE_ENV === "production"),
  };
}

export async function getGuardianWorkspaceId(): Promise<string | undefined> {
  return (await cookies()).get(GUARDIAN_WORKSPACE_COOKIE)?.value;
}

export async function setGuardianWorkspaceId(dependentPersonId: string): Promise<void> {
  (await cookies()).set(GUARDIAN_WORKSPACE_COOKIE, dependentPersonId, getCookieOptions());
}

export async function clearGuardianWorkspaceId(): Promise<void> {
  (await cookies()).delete(GUARDIAN_WORKSPACE_COOKIE);
}
