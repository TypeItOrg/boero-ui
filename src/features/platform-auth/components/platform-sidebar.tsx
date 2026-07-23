"use client";

import type { ComponentProps } from "react";
import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@common/components/ui/sidebar";
import { cn } from "@common/utils/cn.util";
import {
  PlatformSidebarItemIcon,
  PlatformSidebarNav,
  platformSidebarItemButtonClassName,
} from "@features/platform-auth/components/platform-sidebar-nav";
import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";
import { PLATFORM_NAVIGATION_ITEMS } from "@features/platform-auth/constants/platform-navigation.constants";

export function PlatformSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
  const { resolvedTheme, setTheme } = useTheme();
  const logout = useLogoutPlatform();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="sidebar"
      className={cn(
        "bg-background [&_[data-slot=sidebar-inner]]:bg-muted [&_[data-slot=sidebar-inner]]:shadow-none! [&_[data-slot=sidebar-inner]]:ring-0!",
        className,
      )}
      {...props}
    >
      <SidebarHeader className="px-4 pt-4 pb-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:pb-0 md:pb-9">
        <div className="flex hidden items-center gap-3 group-data-[collapsible=icon]:hidden md:flex">
          <span className="text-foreground text-lg font-bold tracking-tight">Boero</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <PlatformSidebarNav items={PLATFORM_NAVIGATION_ITEMS} />
      </SidebarContent>
      <SidebarFooter className="px-4 pb-4 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:px-2">
        <SidebarMenu className="gap-1 group-data-[collapsible=icon]:gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-label="Cambiar tema"
              className={platformSidebarItemButtonClassName}
              onClick={toggleTheme}
              tooltip="Cambiar tema"
            >
              <PlatformSidebarItemIcon>
                <SunIcon className="hidden dark:block" />
                <MoonIcon className="dark:hidden" />
              </PlatformSidebarItemIcon>
              <span className="group-data-[collapsible=icon]:hidden">Cambiar tema</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              aria-label={logout.isPending ? "Cerrando sesión" : "Cerrar sesión"}
              className={platformSidebarItemButtonClassName}
              disabled={logout.isPending}
              onClick={() => logout.mutate()}
              tooltip="Cerrar sesión"
            >
              <PlatformSidebarItemIcon>
                <LogOutIcon />
              </PlatformSidebarItemIcon>
              <span className="group-data-[collapsible=icon]:hidden">
                {logout.isPending ? "Cerrando sesión" : "Cerrar sesión"}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
