"use client";

import type { ComponentProps } from "react";
import Link from "next/link";
import { ChevronsUpDownIcon, LogOutIcon, MoonIcon, SunIcon, UserRoundIcon } from "lucide-react";
import { useTheme } from "next-themes";

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
import { Sidebar, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@common/components/ui/sidebar";
import { useMobileSidebarNavigation } from "@common/hooks/use-mobile-sidebar-navigation";
import { logoutInstitutional } from "@features/institutional-auth/actions/institutional-logout.action";
import { InstitutionalSidebarNav } from "@features/institutional-auth/components/institutional-sidebar-nav";
import type { InstitutionalUser } from "@features/institutional-auth/types/institutional-user.types";
import type { InstitutionalNavigationSection } from "@features/institutional-auth/utils/institutional-navigation.util";
import { cn } from "@common/utils/cn.util";

type InstitutionalSidebarProps = ComponentProps<typeof Sidebar> & {
  user: InstitutionalUser;
  navigationSections: readonly InstitutionalNavigationSection[];
};

export function InstitutionalSidebar({ user, navigationSections, className, ...props }: InstitutionalSidebarProps): React.ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const navigation = useMobileSidebarNavigation();
  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className={cn("bg-muted [&_[data-slot=sidebar-inner]]:bg-muted", className)} {...props}>
      <SidebarContent className="p-4">
        <InstitutionalSidebarNav sections={navigationSections} navigation={navigation} />
      </SidebarContent>

      <SidebarFooter className="border-sidebar-border border-t p-4 group-data-[collapsible=icon]:items-center">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip={`${user.name} ${user.lastName}`}
                  className="hover:text-sidebar-foreground px-0 group-data-[collapsible=icon]:p-0! hover:bg-transparent focus-visible:ring-0 focus-visible:outline-none"
                >
                  <InstitutionalUserAvatar user={user} />
                  <span className="min-w-0 flex-1 text-left group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-sm font-semibold">
                      {user.name} {user.lastName}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs">{user.documentNumber}</span>
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
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56"
              >
                <DropdownMenuLabel className="flex items-center gap-2">
                  <InstitutionalUserAvatar user={user} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {user.name} {user.lastName}
                    </span>
                    <span className="text-muted-foreground block truncate text-xs font-normal">{user.documentNumber}</span>
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" onClick={() => navigation.handleNavigation("/profile")}>
                      <UserRoundIcon />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}>
                    {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
                    Cambiar tema
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <form action={logoutInstitutional}>
                  <DropdownMenuItem asChild>
                    <button type="submit" className="w-full">
                      <LogOutIcon />
                      Cerrar sesión
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function InstitutionalUserAvatar({ user }: { user: InstitutionalUser }): React.ReactElement {
  return (
    <Avatar className="size-[34px] rounded-md group-data-[collapsible=icon]:size-8!">
      <AvatarFallback className="bg-primary text-primary-foreground rounded-md font-semibold">{getInitials(user.name, user.lastName)}</AvatarFallback>
    </Avatar>
  );
}

function getInitials(name: string, lastName: string): string {
  return `${name.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
