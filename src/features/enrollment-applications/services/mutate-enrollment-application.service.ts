import "server-only";

import { getResponseErrorActionState } from "@common/utils/action-state.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { institutionalApiFetch } from "@features/institutional-auth/services/institutional-api-fetch.service";
import type { ChangeEnrollmentCareerResult } from "@features/enrollment-applications/types/change-enrollment-career-result.types";

export async function mutateEnrollmentApplication(
  path: string,
  method: "POST" | "PATCH",
  fallbackMessage: string,
  body?: unknown,
): Promise<ChangeEnrollmentCareerResult> {
  await requireInstitutionalUser();

  const response = institutionalApiFetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const failure = await getResponseErrorActionState(response, [], fallbackMessage);

  if (failure) {
    return { error: failure.error || fallbackMessage };
  }

  try {
    return { application: await (await response).json() };
  } catch {
    return { error: fallbackMessage };
  }
}
