"use client";

import { LogOutIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react";
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
import { Input } from "@common/components/ui/input";
import { SidebarTrigger } from "@common/components/ui/sidebar";
import { useLogoutPlatform } from "@features/platform-auth/hooks/use-logout-platform.hook";
import { usePlatformAccount } from "@features/platform-auth/hooks/use-platform-account.hook";

export function PlatformTopbar(): React.ReactElement {
  const { resolvedTheme, setTheme } = useTheme();
  const logout = useLogoutPlatform();
  const { account } = usePlatformAccount();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="bg-muted flex h-16 shrink-0 items-center justify-between gap-3 rounded-xl px-3 sm:px-4">
      <div className="flex max-w-xl flex-1 items-center gap-3">
        <SidebarTrigger className="bg-background hover:bg-accent size-9 shrink-0 rounded-lg shadow-xs md:hidden" />
        <div className="relative w-full">
          <SearchIcon className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            aria-label="Buscar"
            placeholder="Buscar..."
            className="bg-background h-9 w-full rounded-lg border-0 pl-9 shadow-xs"
          />
        </div>
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
    </header>
  );
}

function getAccountInitials(name?: string, lastName?: string): string {
  const first = name?.charAt(0) ?? "";
  const last = lastName?.charAt(0) ?? "";
  return `${first}${last}`.toUpperCase();
}
