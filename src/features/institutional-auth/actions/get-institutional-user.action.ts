"use server";

import { getInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";

export async function getInstitutionalUserAction() {
  return getInstitutionalUser();
}
