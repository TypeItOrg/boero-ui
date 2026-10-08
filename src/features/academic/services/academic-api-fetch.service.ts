import "server-only";

import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import { platformApiFetch } from "@features/platform-auth/services/platform-api-fetch.service";

export function academicApiFetch(scope: AcademicScopeType, path: string, init: RequestInit = {}): Promise<Response> {
  return AcademicScope.isAdmin(scope) ? platformApiFetch(path, init) : institutionalApiFetch(path, init);
}
