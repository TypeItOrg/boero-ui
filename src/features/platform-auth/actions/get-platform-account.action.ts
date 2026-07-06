"use server";

import { getPlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function getPlatformAccountAction() {
  return getPlatformAccount();
}
