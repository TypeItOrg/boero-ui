import { Suspense } from "react";
import { cookies, headers } from "next/headers";

import { SidebarNavigationStateProvider } from "@common/components/navigation/sidebar-navigation-state-provider";
import { SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES } from "@common/constants/sidebar-navigation.constants";
import { parseSidebarNavigationGroupStates } from "@common/utils/sidebar-navigation-cookie.util";
import { InstitutionalShell } from "@features/institutional-auth/components/institutional-shell";
import { InstitutionalRouteSkeleton } from "@features/institutional-auth/components/institutional-route-skeleton";
import { filterActiveGuardianDependents } from "@features/guardian-dependents/utils/guardian-dependent-display.util";
import { fetchGuardianDependents } from "@features/guardian-dependents/services/guardian-dependent.service";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { canManageDependents } from "@features/institutional-auth/utils/institutional-applicant-role.util";
import { getGuardianWorkspaceId } from "@features/guardian-workspace/utils/guardian-workspace-cookie.util";
import { resolveGuardianWorkspaceDependent } from "@features/guardian-workspace/utils/resolve-guardian-workspace-dependent.util";
import { getContextualSearchShortcutPlatform } from "@features/contextual-search/utils/contextual-search-shortcut-platform.util";

type InstitutionalRouteLayoutProps = {
  children: React.ReactNode;
};

export async function InstitutionalRouteLayout({ children }: InstitutionalRouteLayoutProps): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const [person, cookieStore, requestHeaders, dependents] = await Promise.all([
    fetchInstitutionalPerson(),
    cookies(),
    headers(),
    canManageDependents(user) ? fetchGuardianDependents(user.institutionId).then(filterActiveGuardianDependents) : Promise.resolve([]),
  ]);
  const sidebarOpen = cookieStore.get("institutional-sidebar-open")?.value !== "false";
  const sidebarGroupStates = parseSidebarNavigationGroupStates(cookieStore.get(SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES.institutional)?.value);
  const shortcutPlatform = getContextualSearchShortcutPlatform(requestHeaders.get("user-agent"));
  const storedWorkspaceId = await getGuardianWorkspaceId();
  const initialActiveDependentId = resolveGuardianWorkspaceDependent(dependents, storedWorkspaceId)?.dependentPersonId;

  return (
    <SidebarNavigationStateProvider scope="institutional" initialStates={sidebarGroupStates}>
      <InstitutionalShell
        user={user}
        institutionName={person?.institutionName}
        defaultSidebarOpen={sidebarOpen}
        shortcutPlatform={shortcutPlatform}
        dependents={dependents}
        initialActiveDependentId={initialActiveDependentId}
      >
        <Suspense fallback={<InstitutionalRouteSkeleton />}>{children}</Suspense>
      </InstitutionalShell>
    </SidebarNavigationStateProvider>
  );
}
