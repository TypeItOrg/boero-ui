import "server-only";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import type { PeopleScope } from "../utils/people-scope.util";

export function peopleApiFetch(scope: PeopleScope, path: string, init: RequestInit = {}): Promise<Response> {
  if (scope === "institutional") {
    return institutionalApiFetch(path, init);
  }

  return platformApiFetch(path, init);
}
