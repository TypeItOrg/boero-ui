import { parseNullableHttpResponse } from "@common/utils/http-response-error.util";
import type { PlatformAccountAdmin } from "@features/platform-accounts/types/platform-account-admin.types";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PLATFORM_ACCOUNT_ERROR_MESSAGES } from "@features/platform-accounts/constants/error-messages.constants";

export async function fetchPlatformAccountAdmin(id: string): Promise<PlatformAccountAdmin | null> {
  const response = await platformApiFetch(`/api/v1/admin/accounts/${id}`);
  return parseNullableHttpResponse(response, PLATFORM_ACCOUNT_ERROR_MESSAGES.FETCH_ACCOUNT);
}
