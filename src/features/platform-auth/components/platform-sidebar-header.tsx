"use client";

import type { ReactNode } from "react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@common/components/ui/sidebar";

type PlatformSidebarHeaderProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function PlatformSidebarHeader({ title, description, icon }: PlatformSidebarHeaderProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <a href="/platform/dashboard">
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-bold">{title}</span>
              <span className="truncate text-xs">{description}</span>
            </div>

            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
              {icon}
            </div>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
