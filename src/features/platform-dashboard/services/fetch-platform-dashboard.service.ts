import "server-only";

import { createHttpError } from "@common/utils/create-http-error.util";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { PlatformDashboard } from "@features/platform-dashboard/types/platform-dashboard.types";

export async function fetchPlatformDashboard(): Promise<PlatformDashboard> {
  const response = await platformApiFetch("/api/v1/platform/dashboard");

  if (!response.ok) {
    throw createHttpError("No se pudo obtener el resumen de la plataforma", response.status);
  }

  return response.json();
}
