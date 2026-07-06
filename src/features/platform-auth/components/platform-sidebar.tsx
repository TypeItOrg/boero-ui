"use client";

import type { ComponentProps } from "react";
import { LayoutDashboardIcon, SchoolIcon } from "lucide-react";

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@common/components/ui/sidebar";
import { PlatformSidebarHeader } from "@features/platform-auth/components/platform-sidebar-header";
import { PlatformSidebarNav } from "@features/platform-auth/components/platform-sidebar-nav";
import { PlatformSidebarUser } from "@features/platform-auth/components/platform-sidebar-user";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

const navItems = [
  {
    title: "Panel de Control",
    url: "/platform/dashboard",
    icon: <LayoutDashboardIcon />,
  },
];

export function PlatformSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  const { account } = usePlatformAccount();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <PlatformSidebarHeader title="Boero" description="Autogestión para conservatorios" icon={<SchoolIcon />} />
      </SidebarHeader>
      <SidebarContent>
        <PlatformSidebarNav items={navItems} />
      </SidebarContent>
      <SidebarFooter>
        {account ? (
          <PlatformSidebarUser user={{ name: `${account.name} ${account.lastName}`, email: account.email }} />
        ) : null}
      </SidebarFooter>
    </Sidebar>
  );
}
