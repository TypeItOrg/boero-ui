"use client";

import { Avatar, AvatarFallback } from "@common/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@common/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@common/components/ui/sidebar";
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";

import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";
import type { PlatformAccount } from "@features/platform-auth/types/platform-account.types";

type PlatformSidebarUserProps = {
  user: PlatformAccount;
};

export function PlatformSidebarUser({ user }: PlatformSidebarUserProps): React.ReactElement {
  const { isMobile } = useSidebar();
  const { resolvedTheme, setTheme } = useTheme();
  const logout = useLogoutPlatform();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={`${user.name} ${user.lastName}`}
              className="hover:text-sidebar-foreground px-0 group-data-[collapsible=icon]:p-0! hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
            >
              <PlatformUserAvatar user={user} />
              <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                <span className="block truncate text-sm font-semibold">
                  {user.name} {user.lastName}
                </span>
                <span className="text-muted-foreground block truncate text-xs">{user.email}</span>
              </span>
              <ChevronsUpDownIcon className="ml-auto group-data-[collapsible=icon]:hidden" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side={isMobile ? "top" : "right"}
            align={isMobile ? "start" : "end"}
            sideOffset={8}
            onCloseAutoFocus={(event) => event.preventDefault()}
            onPointerDownOutside={(event) => {
              const target = event.target as HTMLElement;
              if (target.closest('[data-sidebar="sidebar"]')) {
                event.preventDefault();
              }
            }}
            className="w-(--radix-dropdown-menu-trigger-width) min-w-64"
          >
            <DropdownMenuLabel className="flex items-center gap-2">
              <PlatformUserAvatar user={user} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {user.name} {user.lastName}
                </span>
                <span className="text-muted-foreground block truncate text-xs font-normal">{user.email}</span>
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
                Cambiar tema
              </DropdownMenuItem>
              <DropdownMenuItem disabled={logout.isPending} onClick={() => logout.mutate()}>
                <LogOutIcon />
                {logout.isPending ? "Cerrando sesión" : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

function PlatformUserAvatar({ user }: { user: PlatformAccount }): React.ReactElement {
  return (
    <Avatar className="size-[34px] rounded-md group-data-[collapsible=icon]:size-8!">
      <AvatarFallback className="bg-primary text-primary-foreground rounded-md font-semibold">{getInitials(user.name, user.lastName)}</AvatarFallback>
    </Avatar>
  );
}

function getInitials(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
