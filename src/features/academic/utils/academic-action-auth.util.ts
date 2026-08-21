import type { AcademicActionState } from "@features/academic/types/academic-action-state.types";
import { AcademicScope, type AcademicScope as AcademicScopeType } from "@features/academic/utils/academic-scope.util";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import type { InstitutionalPermission } from "@features/institutional-auth/types/institutional-permission.types";
import { hasInstitutionalPermission } from "@features/institutional-auth/utils/institutional-permission.util";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export async function authorizeAcademicAction(
  scope: AcademicScopeType,
  institutionId: string,
  permission: InstitutionalPermission,
): Promise<AcademicActionState | undefined> {
  if (AcademicScope.isAdmin(scope)) {
    await requirePlatformAccount();
    return undefined;
  }

  const user = await requireInstitutionalUser();
  const belongsToInstitution = user.institutionId === institutionId;
  const hasPermission = hasInstitutionalPermission(user, permission);
  if (belongsToInstitution && hasPermission) return undefined;
  return { error: "No tenés permisos para modificar esta configuración académica." };
}
