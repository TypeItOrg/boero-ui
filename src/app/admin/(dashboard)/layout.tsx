import { Suspense, type ReactElement, type ReactNode } from "react";

import { cookies, headers } from "next/headers";

import { SidebarNavigationStateProvider } from "@common/components/navigation/sidebar-navigation-state-provider";
import { SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES } from "@common/constants/sidebar-navigation.constants";
import { parseSidebarNavigationGroupStates } from "@common/utils/sidebar-navigation-cookie.util";

import { getContextualSearchShortcutPlatform } from "@features/contextual-search/utils/contextual-search-shortcut-platform.util";
import { PlatformAccountProvider } from "@features/platform-auth/components/platform-account-provider";
import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";
import { PlatformShell } from "@features/platform-auth/components/platform-shell";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";

export default async function PlatformLayout({ children }: { children: ReactNode }): Promise<ReactElement> {
  const [account, cookieStore, requestHeaders] = await Promise.all([requirePlatformAccount(), cookies(), headers()]);

  const sidebarOpen = cookieStore.get("platform-sidebar-open")?.value !== "false";

  const sidebarGroupStates = parseSidebarNavigationGroupStates(cookieStore.get(SIDEBAR_NAVIGATION_GROUPS_COOKIE_NAMES.platform)?.value);

  const shortcutPlatform = getContextualSearchShortcutPlatform(requestHeaders.get("user-agent"));

  return (
    <PlatformAccountProvider initialAccount={account}>
      <SidebarNavigationStateProvider scope="platform" initialStates={sidebarGroupStates}>
        <PlatformShell defaultSidebarOpen={sidebarOpen} shortcutPlatform={shortcutPlatform}>
          <Suspense fallback={<PlatformRouteSkeleton />}>{children}</Suspense>
        </PlatformShell>
      </SidebarNavigationStateProvider>
    </PlatformAccountProvider>
  );
}
