"use server";

import { revalidatePath } from "next/cache";

import { INVALID_ACTION_ARGUMENTS, isValidUuid } from "@common/utils/action-argument.util";
import { getResponseErrorActionState, type FieldActionState } from "@common/utils/action-state.util";
import { GUARDIAN_LINK_MESSAGES, getPlatformGuardianLinksApiPath } from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkDecision } from "@features/guardian-links/types/guardian-link-request.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

const DECISIONS: readonly GuardianLinkDecision[] = ["approve", "reject"];
const PLATFORM_GUARDIAN_LINKS_PAGE_PATH = "/admin/guardian-links";

export async function resolvePlatformGuardianLinkAction(
  institutionId: string,
  linkId: string,
  decision: GuardianLinkDecision,
): Promise<FieldActionState<never>> {
  if (!isValidUuid(institutionId) || !isValidUuid(linkId) || !DECISIONS.includes(decision)) {
    return { error: INVALID_ACTION_ARGUMENTS };
  }

  const errorState = await getResponseErrorActionState(
    platformApiFetch(`${getPlatformGuardianLinksApiPath()}/${institutionId}/${linkId}/${decision}`, { method: "POST" }),
    [],
    GUARDIAN_LINK_MESSAGES.RESOLVE,
  );

  if (errorState) {
    return errorState;
  }

  revalidatePath(PLATFORM_GUARDIAN_LINKS_PAGE_PATH);

  return { success: true };
}
