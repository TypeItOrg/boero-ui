"use client";

import * as React from "react";

import { MobileBottomNavigation } from "@common/components/navigation/mobile-bottom-navigation";
import { SidebarInset, SidebarProvider } from "@common/components/ui/sidebar";
import { InstitutionalSidebar } from "@features/institutional-auth/components/institutional-sidebar";
import { InstitutionalTopbar } from "@features/institutional-auth/components/institutional-topbar";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import {
  INSTITUTIONAL_PRIMARY_NAVIGATION_ITEM,
  getInstitutionalNavigationSections,
} from "@features/institutional-auth/utils/institutional-navigation.util";

type InstitutionalShellProps = {
  children: React.ReactNode;
  user: InstitutionalUser;
  institutionName?: string;
  defaultSidebarOpen: boolean;
};

export function InstitutionalShell({
  children,
  user,
  institutionName,
  defaultSidebarOpen,
}: InstitutionalShellProps): React.ReactElement {
  const [sidebarOpen, setSidebarOpen] = React.useState(defaultSidebarOpen);
  const navigationSections = getInstitutionalNavigationSections(user);
  const navigationItems = navigationSections
    .flatMap((section) => section.items)
    .filter((item) => item.url !== INSTITUTIONAL_PRIMARY_NAVIGATION_ITEM.url)
    .slice(0, 4);

  function handleSidebarOpenChange(open: boolean): void {
    setSidebarOpen(open);
    document.cookie = `institutional-sidebar-open=${open}; path=/; max-age=31536000; samesite=lax`;
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
      <InstitutionalSidebar user={user} institutionName={institutionName} navigationSections={navigationSections} />
      <SidebarInset className="bg-background gap-3 pb-[calc((var(--spacing)*21)+env(safe-area-inset-bottom))] md:m-0 md:ml-0 md:gap-4 md:rounded-none md:p-4 md:shadow-none md:peer-data-[state=collapsed]:ml-0">
        <InstitutionalTopbar />
        <div className="bg-muted flex min-w-0 flex-1 flex-col overflow-x-hidden rounded-2xl">{children}</div>
      </SidebarInset>
      <MobileBottomNavigation items={navigationItems} primaryItem={INSTITUTIONAL_PRIMARY_NAVIGATION_ITEM} />
    </SidebarProvider>
  );
}
