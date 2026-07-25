import "server-only";

import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";
import { PeopleScope, type PeopleScope as PeopleScopeType } from "@features/people/utils/people-scope.util";

export function peopleApiFetch(scope: PeopleScopeType, path: string, init: RequestInit = {}): Promise<Response> {
  if (PeopleScope.isInstitutional(scope)) {
    return institutionalApiFetch(path, init);
  }

  return platformApiFetch(path, init);
}
