"use client";

import { Avatar, AvatarFallback } from "@common/components/ui/avatar";
import { Button } from "@common/components/ui/button";
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
import { LogOutIcon, UserRoundIcon } from "lucide-react";

import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";

type PlatformSidebarUserProps = {
  user: {
    name: string;
    email: string;
  };
};

export function PlatformSidebarUser({ user }: PlatformSidebarUserProps) {
  const { isMobile } = useSidebar();
  const logout = useLogoutPlatform();

  if (isMobile) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="bg-sidebar-accent/50 flex items-center gap-2 rounded-lg p-2">
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <Avatar className="size-9 rounded-full group-data-[collapsible=icon]:size-8 after:border-0">
                <AvatarFallback className="bg-primary text-primary-foreground rounded-full [&>svg]:size-[18px]">
                  <UserRoundIcon />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => logout.mutate()}
              disabled={logout.isPending}
              aria-label="Cerrar sesión"
            >
              <LogOutIcon />
            </Button>
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" className="focus-visible:ring-0 focus-visible:outline-none">
              <div className="grid flex-1 text-sm leading-tight group-data-[collapsible=icon]:hidden">
                <div>
                  <span className="font-semibold">{user.name}</span>
                </div>
                <span className="truncate text-xs italic">{user.email}</span>
              </div>
              <Avatar className="size-9 rounded-full group-data-[collapsible=icon]:size-8 after:border-0">
                <AvatarFallback className="bg-primary text-primary-foreground rounded-full [&>svg]:size-4.5">
                  <UserRoundIcon />
                </AvatarFallback>
              </Avatar>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-fit" side="right" align="end" sideOffset={4}>
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="size-9 rounded-full group-data-[collapsible=icon]:size-8 after:border-0">
                  <AvatarFallback className="bg-primary text-primary-foreground rounded-full [&>svg]:size-4.5">
                    <UserRoundIcon />
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem disabled={logout.isPending} onClick={() => logout.mutate()}>
                <LogOutIcon />
                {logout.isPending ? "Cerrando sesión..." : "Cerrar sesión"}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
