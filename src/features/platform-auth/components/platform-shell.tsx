"use client";

import * as React from "react";

import { SidebarInset, SidebarProvider } from "@common/components/ui/sidebar";
import { PlatformMobileBottomNavigation } from "@features/platform-auth/components/platform-mobile-bottom-navigation";
import { PlatformSidebar } from "@features/platform-auth/components/platform-sidebar";
import { PlatformTopbar } from "@features/platform-auth/components/platform-topbar";
import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";

type PlatformShellProps = {
  children: React.ReactNode;
  defaultSidebarOpen: boolean;
  shortcutPlatform: ContextualSearchShortcutPlatform;
};

export function PlatformShell({ children, defaultSidebarOpen, shortcutPlatform }: PlatformShellProps): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = React.useState(defaultSidebarOpen);

  function handleSidebarOpenChange(open: boolean): void {
    setSidebarOpen(open);
    document.cookie = `platform-sidebar-open=${open}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={handleSidebarOpenChange}
      style={
        {
          "--sidebar-width": "16rem",
          "--sidebar-width-mobile": "18rem",
          "--sidebar-width-icon": "4.5rem",
        } as React.CSSProperties
      }
    >
      <PlatformSidebar />
      <SidebarInset className="bg-background gap-3 pb-[calc((var(--spacing)*21)+env(safe-area-inset-bottom))] md:m-0 md:ml-0 md:gap-4 md:rounded-none md:p-4 md:shadow-none md:peer-data-[state=collapsed]:ml-0">
        <PlatformTopbar shortcutPlatform={shortcutPlatform} />
        <div className="bg-muted flex min-w-0 flex-1 flex-col overflow-x-hidden rounded-none md:rounded-2xl">{children}</div>
      </SidebarInset>
      <PlatformMobileBottomNavigation />
    </SidebarProvider>
  );
}
