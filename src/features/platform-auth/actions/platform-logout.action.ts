"use server";

import { redirect } from "next/navigation";

import { logoutPlatformAccount } from "@features/platform-auth/services/logout-platform-account.service";
import { clearPlatformAuthCookies } from "@features/platform-auth/utils/platform-auth-cookies.util";

export async function logoutPlatform(): Promise<never> {
  await logoutPlatformAccount();
  await clearPlatformAuthCookies();
  redirect("/auth/platform/login");
}
