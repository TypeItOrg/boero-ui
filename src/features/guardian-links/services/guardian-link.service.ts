import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";

import type { GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import { GUARDIAN_LINK_MESSAGES, getGuardianLinksApiPath } from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkAttachment, GuardianLinkRequest } from "@features/guardian-links/types/guardian-link-request.types";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

type GuardianLinkSummary = Omit<GuardianLinkRequest, "attachments">;

/** Requests of the institution, each with the documents the tutor attached. */
export async function fetchGuardianLinkRequests(institutionId: string, status: GuardianLinkStatus): Promise<GuardianLinkRequest[]> {
  const links = await parseHttpResponse<GuardianLinkSummary[]>(
    await institutionalApiFetch(`${getGuardianLinksApiPath(institutionId)}?status=${status}`),
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

export async function fetchInstitutionGuardianLinkRequests(institutionId: string): Promise<GuardianLinkRequest[]> {
  const requests = await Promise.all((["PENDING", "ACTIVE", "REJECTED"] as const).map((status) => fetchGuardianLinkRequests(institutionId, status)));

  return requests.flat();
}
