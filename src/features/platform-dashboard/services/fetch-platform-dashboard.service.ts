import "server-only";

import { parseHttpResponse } from "@common/utils/http-response-error.util";
import { PLATFORM_DASHBOARD_ERROR_MESSAGES } from "@features/platform-dashboard/constants/error-messages.constants";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { PlatformDashboard } from "@features/platform-dashboard/types/platform-dashboard.types";

export async function fetchPlatformDashboard(): Promise<PlatformDashboard> {
  const response = await platformApiFetch("/api/v1/platform/dashboard");

  return parseHttpResponse(response, PLATFORM_DASHBOARD_ERROR_MESSAGES.FETCH_DASHBOARD);
}
