"use client";

import * as React from "react";

import { SidebarInset, SidebarProvider } from "@common/components/ui/sidebar";
import { InstitutionalSidebar } from "@features/institutional-auth/components/institutional-sidebar";
import { InstitutionalTopbar } from "@features/institutional-auth/components/institutional-topbar";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";

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
      <InstitutionalSidebar user={user} institutionName={institutionName} />
      <SidebarInset className="bg-background gap-4 p-3 md:m-0 md:ml-0 md:rounded-none md:p-4 md:shadow-none md:peer-data-[state=collapsed]:ml-0">
        <InstitutionalTopbar />
        <div className="bg-muted flex min-w-0 flex-1 flex-col overflow-x-hidden rounded-2xl">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
