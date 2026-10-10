import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { getPlatformGuardianLinksApiPath } from "@features/guardian-links/constants/guardian-link.constants";
import type { GuardianLinkAttachment, GuardianLinkRequest } from "@features/guardian-links/types/guardian-link-request.types";
import type { GuardianLinkStatus } from "@features/guardian-dependents/types/guardian-link-status.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export async function fetchPlatformGuardianLinkRequests(status: GuardianLinkStatus): Promise<GuardianLinkRequest[]> {
  const requests = await parseHttpResponse<GuardianLinkRequest[]>(
    await platformApiFetch(`${getPlatformGuardianLinksApiPath()}?status=${status}`),
    "No se pudieron cargar las solicitudes de vinculación.",
  );

  return Promise.all(
    requests.map(async (request) => ({
      ...request,
      attachments: await parseHttpResponse<GuardianLinkAttachment[]>(
        await platformApiFetch(`${getPlatformGuardianLinksApiPath()}/${request.institution?.institutionId}/${request.personGuardianId}/attachments`),
        "No se pudo cargar la documentación de la solicitud.",
      ),
    })),
  );
}

export async function fetchAllPlatformGuardianLinkRequests(): Promise<GuardianLinkRequest[]> {
  const requests = await Promise.all((["PENDING", "ACTIVE", "REJECTED"] as const).map(fetchPlatformGuardianLinkRequests));

  return requests.flat();
}
