import { Suspense } from "react";
import { cookies, headers } from "next/headers";

import { PlatformAccountProvider } from "@features/platform-auth/components/platform-account-provider";
import { PlatformRouteSkeleton } from "@features/platform-auth/components/platform-route-skeleton";
import { PlatformShell } from "@features/platform-auth/components/platform-shell";
import { requirePlatformAccount } from "@features/platform-auth/services/get-platform-account.service";
import { getContextualSearchShortcutPlatform } from "@features/contextual-search/utils/contextual-search-shortcut-platform.util";

export default async function PlatformLayout({ children }: { children: React.ReactNode }): Promise<React.ReactElement> {
  const [account, cookieStore, requestHeaders] = await Promise.all([requirePlatformAccount(), cookies(), headers()]);
  const sidebarOpen = cookieStore.get("platform-sidebar-open")?.value !== "false";
  const shortcutPlatform = getContextualSearchShortcutPlatform(requestHeaders.get("user-agent"));

  return (
    <PlatformAccountProvider initialAccount={account}>
      <PlatformShell defaultSidebarOpen={sidebarOpen} shortcutPlatform={shortcutPlatform}>
        <Suspense fallback={<PlatformRouteSkeleton />}>{children}</Suspense>
      </PlatformShell>
    </PlatformAccountProvider>
  );
}
