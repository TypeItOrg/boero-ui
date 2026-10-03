import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { GUARDIAN_LINK_MESSAGES, getGuardianLinksApiPath } from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkAttachment, GuardianLinkRequest } from "@features/guardian-links/types/guardian-link-request.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

type GuardianLinkSummary = Omit<GuardianLinkRequest, "attachments">;

/** Pending requests of the institution, each with the documents the tutor attached. */
export async function fetchPendingGuardianLinkRequests(institutionId: string): Promise<GuardianLinkRequest[]> {
  const links = await parseHttpResponse<GuardianLinkSummary[]>(
    await institutionalApiFetch(`${getGuardianLinksApiPath(institutionId)}?status=PENDING`),
    GUARDIAN_LINK_MESSAGES.FETCH,
  );

  return Promise.all(
    links.map(async (link) => ({
      ...link,
      attachments: await parseHttpResponse<GuardianLinkAttachment[]>(
        await institutionalApiFetch(`${getGuardianLinksApiPath(institutionId)}/${link.personGuardianId}/attachments`),
        GUARDIAN_LINK_MESSAGES.FETCH_ATTACHMENTS,
      ),
    })),
  );
}
