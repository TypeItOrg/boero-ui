"use client";

import { LogOutIcon, MoonIcon, SunIcon } from "lucide-react";
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
import { SidebarTrigger } from "@common/components/ui/sidebar";
import { ContextualSearch } from "@features/contextual-search/components/contextual-search";
import { PLATFORM_NAVIGATION_ITEMS } from "@features/platform-auth/constants/platform-navigation.constants";
import type { ContextualSearchAccessSection } from "@features/contextual-search/types/contextual-search-access-section.types";
import type { ContextualSearchShortcutPlatform } from "@features/contextual-search/types/contextual-search-shortcut-platform.types";
import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

const PLATFORM_CONTEXTUAL_SEARCH_SECTIONS = [
  { items: PLATFORM_NAVIGATION_ITEMS },
] satisfies readonly ContextualSearchAccessSection[];

type PlatformTopbarProps = {
  shortcutPlatform: ContextualSearchShortcutPlatform;
};

export function PlatformTopbar({ shortcutPlatform }: PlatformTopbarProps): React.ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const logout = useLogoutPlatform();
  const { account } = usePlatformAccount();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="topbar-sticky sticky top-0 z-10 h-16 shrink-0">
      <div className="topbar-surface bg-muted flex h-full w-full items-center justify-between gap-3 rounded-none border border-transparent px-3 transition-[background-color,border-color,box-shadow] duration-300 ease-out motion-reduce:transition-none sm:px-4 md:gap-6 md:rounded-xl">
        <div className="flex max-w-2xl flex-1 items-center gap-3 xl:max-w-xl">
          <SidebarTrigger className="bg-background hover:bg-accent size-9 shrink-0 rounded-lg shadow-xs md:hidden" />
          <ContextualSearch
            accessSections={PLATFORM_CONTEXTUAL_SEARCH_SECTIONS}
            scope="platform"
            mobileVariant="input"
            shortcutPlatform={shortcutPlatform}
            className="rounded-lg bg-transparent p-0"
          />
        </div>

        {account ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hover:bg-muted-foreground/5 -mx-2 flex cursor-pointer items-center gap-3 rounded-lg p-1 px-2 text-left transition-colors focus:outline-none">
                <div className="hidden flex-col text-right leading-tight md:flex">
                  <span className="text-foreground text-sm font-semibold">
                    {account.name} {account.lastName}
                  </span>
                  <span className="text-muted-foreground text-xs opacity-80">{account.email}</span>
                </div>
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {getAccountInitials(account.name, account.lastName)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal md:hidden">
                <div className="flex flex-col space-y-1">
                  <p className="text-foreground text-sm font-semibold">
                    {account.name} {account.lastName}
                  </p>
                  <p className="text-muted-foreground text-xs leading-none">{account.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={toggleTheme}>
                  <SunIcon className="mr-2 hidden size-4 dark:block" />
                  <MoonIcon className="mr-2 size-4 dark:hidden" />
                  <span>Cambiar tema</span>
                </DropdownMenuItem>
                <DropdownMenuItem disabled={logout.isPending} onClick={() => logout.mutate()}>
                  <LogOutIcon className="mr-2 size-4" />
                  <span>{logout.isPending ? "Cerrando sesión" : "Cerrar sesión"}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </div>
    </header>
  );
}

function getAccountInitials(name?: string, lastName?: string): string {
  const first = name?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}
