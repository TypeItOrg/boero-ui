"use client";

import type { ComponentProps } from "react";

import { Sidebar, SidebarContent, SidebarFooter } from "@common/components/ui/sidebar";
import { cn } from "@common/utils/cn.util";
import { PlatformSidebarNav } from "@features/platform-auth/components/platform-sidebar-nav";
import { PlatformSidebarUser } from "@features/platform-auth/components/platform-sidebar-user";
import { PLATFORM_NAVIGATION_SECTIONS } from "@features/platform-auth/constants/platform-navigation.constants";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

export function PlatformSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
  const { account } = usePlatformAccount();

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(
        "bg-muted [&_[data-slot=sidebar-inner]]:bg-muted [&_[data-slot=sidebar-inner]]:shadow-none! [&_[data-slot=sidebar-inner]]:ring-0!",
        className,
      )}
      {...props}
    >
      <SidebarContent className="p-4">
        <PlatformSidebarNav sections={PLATFORM_NAVIGATION_SECTIONS} />
      </SidebarContent>
      <SidebarFooter className="border-sidebar-border border-t p-4 group-data-[collapsible=icon]:items-center">
        {account ? <PlatformSidebarUser user={account} /> : null}
      </SidebarFooter>
    </Sidebar>
  );
}
