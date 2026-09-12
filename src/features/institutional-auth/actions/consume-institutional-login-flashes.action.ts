"use server";

import { clearInstitutionalLoginFlashCookies } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export async function consumeInstitutionalLoginFlashes(): Promise<void> {
  await clearInstitutionalLoginFlashCookies();
}
