"use server";

import { redirect } from "next/navigation";

import { logoutInstitutionalAccount } from "@features/institutional-auth/services/logout-institutional-account.service";
import { clearInstitutionalAuthCookies } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export async function logoutInstitutional(): Promise<never> {
  await logoutInstitutionalAccount();
  await clearInstitutionalAuthCookies();
  redirect("/auth/login");
}
