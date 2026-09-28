import "server-only";

import { fetchEnrollmentApplicationById } from "@features/enrollment-applications/services/enrollment-application.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { isGuardian } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";

export async function canMutateEnrollmentApplication(applicationId: string): Promise<boolean> {
  const user = await requireInstitutionalUser();

  if (!isGuardian(user)) {
    return true;
  }

  const workspaceId = await getGuardianWorkspaceId();

  if (!workspaceId) {
    return false;
  }

  const application = await fetchEnrollmentApplicationById(applicationId).catch(() => null);

  return application?.personId === workspaceId;
}
