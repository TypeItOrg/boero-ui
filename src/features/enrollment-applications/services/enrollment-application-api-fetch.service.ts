import "server-only";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";

export function enrollmentApplicationApiFetch(path: string, init?: RequestInit): Promise<Response> {
  return institutionalApiFetch(path, init);
}
