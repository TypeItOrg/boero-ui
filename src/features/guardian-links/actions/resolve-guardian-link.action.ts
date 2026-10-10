"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, type FieldActionState } from "@common/utils/action-state.util";

import {
  GUARDIAN_LINK_MESSAGES,
  GUARDIAN_LINKS_PAGE_PATH,
  getGuardianLinksApiPath,
} from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkDecision } from "@features/guardian-links/types/guardian-link-request.types";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { canReviewGuardianLinks } from "@features/institutional-auth/utils/institutional-applicant-role.util";

const DECISIONS: readonly GuardianLinkDecision[] = ["approve", "reject"];

export async function resolveGuardianLinkAction(
  institutionId: string,
  linkId: string,
  decision: GuardianLinkDecision,
): Promise<FieldActionState<never>> {
  if (!isValidUuid(institutionId) || !isValidUuid(linkId) || !DECISIONS.includes(decision)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  // Friendly early check; the backend enforces the same permission and institution boundary.
  const user = await requireInstitutionalUser();

  if (user.institutionId !== institutionId || !canReviewGuardianLinks(user)) {
    return { error: GUARDIAN_LINK_MESSAGES.FORBIDDEN };
  }

  const errorState = await getResponseErrorActionState(
    institutionalApiFetch(`${getGuardianLinksApiPath(institutionId)}/${linkId}/${decision}`, { method: "POST" }),
    [],
    GUARDIAN_LINK_MESSAGES.RESOLVE,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(GUARDIAN_LINKS_PAGE_PATH);

  return { success: true };
}
