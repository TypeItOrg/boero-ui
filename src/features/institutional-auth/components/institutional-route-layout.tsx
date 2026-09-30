import { Suspense } from "react";
import { cookies, headers } from "next/headers";

import { SidebarNavigationStateProvider } from "@common/components/navigation/sidebar-navigation-state-provider";
import { SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES } from "@common/constants/sidebar-navigation.constants";
import { parseSidebarNavigationGroupStates } from "@common/utils/sidebar-navigation-cookie.util";
import { InstitutionalShell } from "@features/institutional-auth/components/institutional-shell";
import { InstitutionalRouteSkeleton } from "@features/institutional-auth/components/institutional-route-skeleton";
import { fetchInstitutionalPerson } from "@features/institutional-auth/services/fetch-institutional-person.service";
import { requireInstitutionalUser } from "@features/institutional-auth/services/get-institutional-user.service";
import { getContextualSearchShortcutPlatform } from "@features/contextual-search/utils/contextual-search-shortcut-platform.util";

type InstitutionalRouteLayoutProps = {
  children: React.ReactNode;
};

export async function InstitutionalRouteLayout({ children }: InstitutionalRouteLayoutProps): Promise<React.ReactElement> {
  const user = await requireInstitutionalUser();
  const [person, cookieStore, requestHeaders] = await Promise.all([fetchInstitutionalPerson(), cookies(), headers()]);
  const sidebarOpen = cookieStore.get("institutional-sidebar-open")?.value !== "false";
  const sidebarGroupStates = parseSidebarNavigationGroupStates(cookieStore.get(SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES.institutional)?.value);
  const shortcutPlatform = getContextualSearchShortcutPlatform(requestHeaders.get("user-agent"));

  return (
    <SidebarNavigationStateProvider scope="institutional" initialStates={sidebarGroupStates}>
      <InstitutionalShell user={user} institutionName={person?.institutionName} defaultSidebarOpen={sidebarOpen} shortcutPlatform={shortcutPlatform}>
        <Suspense fallback={<InstitutionalRouteSkeleton />}>{children}</Suspense>
      </InstitutionalShell>
    </SidebarNavigationStateProvider>
  );
}
