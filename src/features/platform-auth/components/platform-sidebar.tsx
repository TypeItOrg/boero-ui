"use client";

import type { ComponentProps } from "react";
import { BuildingIcon, FingerprintIcon, HouseIcon, LogOutIcon, MoonIcon, SunIcon, UsersIcon } from "lucide-react";
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

const navItems = [
  {
    title: "Inicio",
    url: "/platform",
    icon: HouseIcon,
    exact: true,
  },
  {
    title: "Instituciones",
    url: "/platform/institutions",
    icon: BuildingIcon,
  },
  {
    title: "Usuarios",
    url: "/platform/people",
    icon: UsersIcon,
  },
  {
    title: "Administradores",
    url: "/platform/accounts",
    icon: FingerprintIcon,
  },
];

export function PlatformSidebar({ className, ...props }: ComponentProps<typeof Sidebar>) {
  const { resolvedTheme, setTheme } = useTheme();
  const logout = useLogoutPlatform();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <Sidebar
      collapsible="icon"
      variant="floating"
      className={cn(
        "bg-background [&_[data-slot=sidebar-inner]]:bg-muted md:py-4! md:pr-0! md:pl-4! [&_[data-slot=sidebar-inner]]:rounded-xl! [&_[data-slot=sidebar-inner]]:shadow-none! [&_[data-slot=sidebar-inner]]:ring-0!",
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
        <PlatformSidebarNav items={navItems} />
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
