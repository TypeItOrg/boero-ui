"use server";

import { clearInstitutionalPasswordChangedCookie } from "@features/institutional-auth/utils/institutional-auth-cookies.util";

export async function consumeInstitutionalPasswordChangedFlash(): Promise<void> {
  await clearInstitutionalPasswordChangedCookie();
}
